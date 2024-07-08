/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { getWorkflow } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workflow';
import { batchGetWorkspaces, getWorkspace } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workspace';
import { WorkflowConfiguration, WorkflowStepType } from '@aws/galileo-sdk/lib/chat/workflow/types';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Workflow, Workspace } from 'api-typescript-runtime';

interface WorkflowAndWorkspaces {
  readonly workflow: Workflow;
  readonly workspaces: { [workspaceId: string]: Workspace };
}

interface WorkflowBuilderProps {
  documentClient: DynamoDBDocumentClient;
  workspaceTableName: string;
  workflowTableName: string;
  userId: string;
  workflowId: string;
  workflowType: string;
}

const getStepType = (workspace: Workspace): 'REQUEST_RESPONSE' | 'DATA_SEARCH' | 'ROUTER' => {
  if (workspace.type === 'DATA') {
    return 'DATA_SEARCH';
  }

  if (workspace.type === 'ROUTER') {
    return 'ROUTER';
  }

  return 'REQUEST_RESPONSE';
};

class WorkflowBuilder {
  readonly documentClient: DynamoDBDocumentClient;
  readonly userId: string;
  readonly workflowId: string;
  readonly workflowType: string;
  readonly workspaceTableName: string;
  readonly workflowTableName: string;

  constructor(props: WorkflowBuilderProps) {
    this.documentClient = props.documentClient;
    this.workflowTableName = props.workflowTableName;
    this.workspaceTableName = props.workspaceTableName;
    this.userId = props.userId;
    this.workflowId = props.workflowId;
    this.workflowType = props.workflowType;
  }

  async getWorkflowAndWorkspaces(): Promise<WorkflowAndWorkspaces> {
    let workflow: Workflow | undefined;
    if (this.workflowType === 'WORKFLOW') {
      workflow = await getWorkflow(this.documentClient, this.workflowTableName, this.workflowId);

      if (!workflow) {
        throw new Error(`Unable to locate workflow ${this.workflowId}`);
      }
    } else {
      workflow = {
        workflowId: this.workflowId,
        name: `Workflow Wrapper for workspace ${this.workflowId}`,
        definition: {
          workspaceIds: [this.workflowId],
        },
      };
    }

    const workspaces = await batchGetWorkspaces(
      this.documentClient,
      this.workspaceTableName,
      workflow.definition.workspaceIds,
    );

    if (workspaces.some((w) => !w)) {
      throw new Error(`Unable to locate all workspaces data for ${workflow.definition.workspaceIds.join(',')}`);
    }

    return {
      workflow,
      workspaces: (workspaces as Workspace[]).reduce((acc, w) => {
        return {
          ...acc,
          [w.workspaceId]: w,
        };
      }, {}),
    };
  }

  async getRouterWorkspaceRoutes(workspace: Workspace): Promise<{
    [id: string]: WorkflowStepType;
  }> {
    const routeWorkspaces = workspace.routerDefinition?.workspaces;

    if (!routeWorkspaces || routeWorkspaces.length === 0) {
      throw new Error(`workspaces routed by router workspace ${workspace.workspaceId} is empty`);
    }

    const ws = await batchGetWorkspaces(
      this.documentClient,
      this.workspaceTableName,
      routeWorkspaces.map((x) => x.id),
    );

    if (ws.length !== routeWorkspaces.length) {
      throw new Error(`Not all workspaces routed by router workspace ${workspace.workspaceId} does not exist`);
    }

    const workflowSteps = await Promise.all(ws.map(async (w) => this.convertWorkspaceToWorkflowStep(w)));

    return Object.fromEntries(ws.map((w, index) => [w.workspaceId, workflowSteps[index]]));
  }

  async convertWorkspaceToWorkflowStep(workspace: Workspace): Promise<WorkflowStepType> {
    const stepType = getStepType(workspace);
    return {
      workspaceId: workspace.workspaceId,
      llmModelId: workspace.chatModel.modelId,
      promptTemplate: workspace.prompt?.promptTemplate || '',
      ...(stepType === 'ROUTER'
        ? {
            type: stepType,
            responseRouteKey: 'workspaceId',
            routes: await this.getRouterWorkspaceRoutes(workspace),
            additionalPromptSubstitutions: {
              workspaces: workspace.routerDefinition?.workspaces || [],
            },
          }
        : {
            type: stepType,
          }),
    } as WorkflowStepType;
  }

  async build() {
    const { workflow, workspaces } = await this.getWorkflowAndWorkspaces();

    return {
      steps: await Promise.all(
        workflow.definition.workspaceIds.map(async (workspaceId) => {
          const workspace = workspaces[workspaceId];
          return this.convertWorkspaceToWorkflowStep(workspace);
        }),
      ),
    };
  }
}

export default WorkflowBuilder;
