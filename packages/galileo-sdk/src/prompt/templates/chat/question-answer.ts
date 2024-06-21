/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { BASE_CHAT_PARTIALS, ChatTemplatePartials } from './base.js';
import { DEFAULT_PROMPT_TEMPLATES } from './default-prompt-templates.js';
import {
  HandlebarsPromptTemplate,
  HandlebarsPromptTemplateRuntime,
  ScopedHandlebarsPromptTemplateInput,
} from '../../handlebars.js';

export const CHAT_QUESTION_ANSWER_PARTIALS: ChatTemplatePartials = {
  ...BASE_CHAT_PARTIALS,
  Context: '{{>Corpus}}',
  Instruction:
    'You are a research assistant. Based on the following rules and provided corpus {{~>DelimitedBy}}, answer the question. {{>CR}}Rules:{{>LF}}{{>Rules}}',
  Cue: 'Question: {{question}}{{>LF}}Answer: ',
} as const;

export interface ChatQuestionAnswerPromptTemplateInputValues {
  readonly context: string;
  readonly question: string;
  readonly rules?: string[];
}

export type ChatQuestionAnswerPromptTemplateInput = ScopedHandlebarsPromptTemplateInput<
  ChatTemplatePartials,
  ChatQuestionAnswerPromptTemplateInputValues
>;
export type ChatQuestionAnswerPromptRuntime = HandlebarsPromptTemplateRuntime<ChatQuestionAnswerPromptTemplateInput>;

export class ChatQuestionAnswerPromptTemplate extends HandlebarsPromptTemplate<
  ChatTemplatePartials,
  ChatQuestionAnswerPromptTemplateInputValues
> {
  public static defaultTemplate = DEFAULT_PROMPT_TEMPLATES.questionAnswer;

  static async deserialize(data: any) {
    return new ChatQuestionAnswerPromptTemplate(data);
  }

  constructor(input: ChatQuestionAnswerPromptTemplateInput) {
    super({
      template: ChatQuestionAnswerPromptTemplate.defaultTemplate,
      inputVariables: ['context', 'question'],
      ...input,
      partialVariables: {
        // LangChain partials only supports string or function return string... but actually can return anything
        rules: [
          'only use knowledge from the provided corpus to answer the question',
          'always be truthful, honest, unbiased, and unharmful',
          'be concise, do not repeat the question or yourself in the answer',
        ],
        ...input.partialVariables,
      },
      templatePartials: {
        ...CHAT_QUESTION_ANSWER_PARTIALS,
        ...input.templatePartials,
      },
    });
  }
}
