/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { BASE_CHAT_PARTIALS, ChatTemplatePartials } from './base.js';
import { DEFAULT_PROMPT_TEMPLATES } from './default-prompt-templates.js';
import {
  HandlebarsPromptTemplate,
  HandlebarsPromptTemplateRuntime,
  ScopedHandlebarsPromptTemplateInput,
} from '../../handlebars.js';

export const CHAT_ROUTER_PARTIALS: ChatTemplatePartials = {
  ...BASE_CHAT_PARTIALS,
  Context: '{{>Corpus}}',
  Instruction:
    'Workspaces are entities which can answer questions. Based on the following rules and provided workspace definitions {{~>DelimitedBy}}, return the workspace which will best answer the question. {{>CR}}Rules:{{>LF}}{{>Rules}}',
  Cue: 'Question: {{question}}{{>LF}}Answer: ',
} as const;

export interface ChatRouterWorkspace {
  readonly id: string;
  readonly description: string;
}

export interface ChatRouterPromptTemplateInputValues {
  readonly workspaces: ChatRouterWorkspace[];
  readonly question: string;
  readonly rules?: string[];
}

export type ChatRouterPromptTemplateInput = ScopedHandlebarsPromptTemplateInput<
  ChatTemplatePartials,
  ChatRouterPromptTemplateInputValues
>;
export type ChatRouterPromptRuntime = HandlebarsPromptTemplateRuntime<ChatRouterPromptTemplateInput>;

export class ChatRouterPromptTemplate extends HandlebarsPromptTemplate<
  ChatTemplatePartials,
  ChatRouterPromptTemplateInputValues
> {
  public static defaultTemplate = DEFAULT_PROMPT_TEMPLATES.router;

  static async deserialize(data: any) {
    return new ChatRouterPromptTemplate(data);
  }

  constructor(input: ChatRouterPromptTemplateInput) {
    super({
      template: ChatRouterPromptTemplate.defaultTemplate,
      inputVariables: ['workspaces', 'question'],
      ...input,
      partialVariables: {
        rules: [
          `answer only in JSON format with the following specification: ${JSON.stringify({
            workspaceId: 'ID of the workspace which best answers the question',
          })}`,
        ],
        ...input.partialVariables,
      },
      templatePartials: {
        ...CHAT_ROUTER_PARTIALS,
        ...input.templatePartials,
      },
    });
  }
}
