/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { QueryCommandOutput, UpdateCommandOutput, GetCommandOutput } from '@aws-sdk/lib-dynamodb';

type DDBBaseEntity = Keys & {
  createdAt: number;
  entity: string;
};

type UserOwnedBaseEntity = DDBBaseEntity & {
  userId: string;
};

export type DDBChat = UserOwnedBaseEntity &
  GSI1Keys & {
    chatId: string;
    title: string;
    createdAt: number;
    entity: 'CHAT';
    workflowId: string;
    workflowType: string;
  };

export interface DDBChatWorkflow {
  id: string;
  type: 'WORKFLOW' | 'WORKSPACE';
}

export type DDBChatMessage = UserOwnedBaseEntity &
  GSI1Keys & {
    messageId: string;
    chatId: string;
    createdAt: number;
    entity: 'MESSAGE';
    data: {
      content: string;
    };
    type: 'ai' | 'human';
  };

export type DDBWorkspacePrompt = {
  promptTemplate: string;
};

export type DDBWorkspaceChatModel = {
  modelId: string;
  name: string;
};

export type DDBWorkspaceType = 'REQUEST_RESPONSE' | 'DATA' | 'ROUTER';

export type DDBWorkspaceDataImport = {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'FAILURE' | 'SUCCESS';
  statusDetails?: string;
};

export type DDBWorkspaceEmbeddingModelInfo = {
  modelId: string;
  dimensions: number;
};

export type DDBWorkspaceDataIndexing = {
  vectorStorage: {
    aurora: object;
  };
  embeddingModel: DDBWorkspaceEmbeddingModelInfo;
};

export type DDBWorkspaceDataDefinition = {
  indexing?: DDBWorkspaceDataIndexing;
};

export type DDBWorkspaceRouterDefinition = {
  workspaces: DDBWorkspaceRouterTargetWorkspace[];
};

export type DDBWorkspaceRouterTargetWorkspace = {
  id: string;
  description: string;
};

export type DDBWorkspace = {
  workspaceId: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: number;
  type: DDBWorkspaceType;
  prompt?: DDBWorkspacePrompt;
  chatModel: DDBWorkspaceChatModel;
  routerDefinition?: DDBWorkspaceRouterDefinition;
  data?: DDBWorkspaceDataDefinition;
  dataImport?: DDBWorkspaceDataImport;
};

export type DDBWorkflowDefinition = {
  workspaceIds: string[];
};

export type DDBWorkflow = {
  workflowId: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: number;
  definition: DDBWorkflowDefinition;
};

export type DDBMessageSource = UserOwnedBaseEntity & {
  sourceId: string;
  chatId: string;
  messageId: string;
  createdAt: number;
  entity: 'SOURCE';
  pageContent: string;
  metadata: Record<string, any>;
};

export type DDBGetOutput<EntityType> = Omit<GetCommandOutput, 'Item'> & {
  Item?: EntityType | undefined;
};

export type DDBQueryOutput<EntityType, KeyType> = Omit<QueryCommandOutput, 'Items' | 'LastEvaluatedKey'> & {
  Items?: EntityType[] | undefined;
  LastEvaluatedKey?: KeyType | undefined;
};

export type DDBUpdateOutput<EntityType> = Omit<UpdateCommandOutput, 'Attributes'> & {
  Attributes?: EntityType | undefined;
};

export type Keys = {
  PK: string;
  SK: string;
};

export type GSI1Keys = {
  GSI1PK: string;
  GSI1SK?: string | number;
};

export type AllKeys = Keys & GSI1Keys;
