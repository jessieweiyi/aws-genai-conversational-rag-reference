/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { BaseRetriever } from 'langchain/schema/retriever';
import { ChatEngineContext } from '../context.js';

export interface WorkflowStep {
  readonly type: 'REQUEST_RESPONSE' | 'DATA_SEARCH' | 'ROUTER';
  readonly workspaceId: string;
  readonly llmModelId: string;
  readonly promptTemplate: string;
  readonly additionalPromptSubstitutions?: { [key: string]: any };
}

export interface RequestResponseWorkflowStep extends WorkflowStep {
  readonly type: 'REQUEST_RESPONSE';
}

export interface DataSearchWorkflowStep extends WorkflowStep {
  readonly type: 'DATA_SEARCH';
}

export interface RouterWorkflowStep extends WorkflowStep {
  readonly type: 'ROUTER';
  readonly responseRouteKey: string;
  readonly routes: { [responseRouteKeyValue: string]: WorkflowStepType };
}

export type WorkflowStepType = RequestResponseWorkflowStep | DataSearchWorkflowStep | RouterWorkflowStep;

export interface WorkflowConfiguration {
  readonly steps: WorkflowStepType[];
}

export interface ChatEngineWorkflowComponents {
  readonly retriever: BaseRetriever;
  readonly context: ChatEngineContext;
}

export interface ChatEngineRequestResponseWorkflowStep
  extends RequestResponseWorkflowStep,
    ChatEngineWorkflowComponents {}

export interface ChatEngineDataSearchWorkflowStep extends DataSearchWorkflowStep, ChatEngineWorkflowComponents {}

export interface ChatEngineRouterWorkflowStep extends RouterWorkflowStep, ChatEngineWorkflowComponents {
  readonly routes: { [responseRouteKeyValue: string]: ChatEngineWorkflowStep };
}

export type ChatEngineWorkflowStep =
  | ChatEngineRequestResponseWorkflowStep
  | ChatEngineDataSearchWorkflowStep
  | ChatEngineRouterWorkflowStep;

export interface ChatEngineWorkflow {
  readonly steps: ChatEngineWorkflowStep[];
}
