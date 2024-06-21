/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import {
  ChatCondenseQuestionPromptTemplate,
  ChatQuestionAnswerPromptTemplate,
  ChatRouterPromptTemplate,
} from '@aws/galileo-sdk/lib/prompt/templates/chat';
import { WorkspaceType } from 'api-typescript-react-query-hooks';

export const DEFAULT_PROMPTS: Record<WorkspaceType, string> = {
  DATA: ChatQuestionAnswerPromptTemplate.defaultTemplate,
  REQUEST_RESPONSE: ChatCondenseQuestionPromptTemplate.defaultTemplate,
  ROUTER: ChatRouterPromptTemplate.defaultTemplate,
};
