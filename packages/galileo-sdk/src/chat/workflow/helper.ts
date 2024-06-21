/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { PromptTemplate } from 'langchain/prompts';
import { ChatEngineWorkflowStep, WorkflowStep, WorkflowStepType } from './types.js';
import { ChatCondenseQuestionPromptTemplate, ChatQuestionAnswerPromptTemplate } from '../../prompt/index.js';
import { ChatRouterPromptTemplate } from '../../prompt/templates/chat/chat-router.js';
import { ChatEngineContext } from '../context.js';
import { SearchRetriever, SearchRetrieverInput } from '../search.js';

export interface ChatEngineWorkflowComponentsInput {
  readonly step: WorkflowStepType;
  readonly searchOptions: SearchRetrieverInput;
  readonly maxNewTokens: number;
  readonly verbose?: boolean;
}

const promptFromStep = (step: WorkflowStep): PromptTemplate => {
  switch (step.type) {
    case 'REQUEST_RESPONSE':
      return new ChatCondenseQuestionPromptTemplate({
        template: step.promptTemplate,
        partialVariables: step.additionalPromptSubstitutions,
      });
    case 'DATA_SEARCH':
      return new ChatQuestionAnswerPromptTemplate({
        template: step.promptTemplate,
        partialVariables: step.additionalPromptSubstitutions,
      });
    case 'ROUTER':
      return new ChatRouterPromptTemplate({
        template: step.promptTemplate,
        partialVariables: step.additionalPromptSubstitutions,
      });
    default:
      throw new Error(`Unsupported step type ${step.type}`);
  }
};

export class ChatEngineWorkflowHelper {
  public static buildFromStep = async ({
    step,
    searchOptions,
    maxNewTokens,
    verbose,
  }: ChatEngineWorkflowComponentsInput): Promise<ChatEngineWorkflowStep> => ({
    ...step,
    retriever: new SearchRetriever({ ...searchOptions, workspaceId: step.workspaceId }),
    context: new ChatEngineContext(await ChatEngineContext.resolveModelInfo(step.llmModelId), {
      maxNewTokens,
      prompt: promptFromStep(step),
      verbose,
    }),
    ...(step.type === 'ROUTER'
      ? {
          routes: Object.fromEntries(
            await Promise.all(
              Object.entries(step.routes).map(async ([routeKey, s]) => [
                routeKey,
                await ChatEngineWorkflowHelper.buildFromStep({
                  step: s,
                  searchOptions,
                  maxNewTokens,
                  verbose,
                }),
              ]),
            ),
          ),
        }
      : {}),
  });
}
