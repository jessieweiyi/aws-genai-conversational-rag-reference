/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import {
  ChatCondenseQuestionPromptTemplate,
  ChatQuestionAnswerPromptTemplate,
  ChatRouterPromptTemplate,
} from '@aws/galileo-sdk/lib/prompt/templates/chat';
import { useCognitoAuthContext } from '@aws-northstar/ui';
import { FormField } from '@cloudscape-design/components';
import { WorkspaceType } from 'api-typescript-react-query-hooks';
import { FC, useMemo } from 'react';
import PromptEditor, { PromptEditorProps } from './PromptEditor';

export interface WorkspacePromptEditorProps {
  readonly workspaceType: WorkspaceType;
  readonly promptTemplate: string | undefined;
  readonly setPromptTemplate: (template: string) => void;
  readonly additionalPromptInputs?: { [key: string]: any };
}

interface PromptDetails extends Pick<PromptEditorProps, 'promptCls' | 'defaultInputValues'> {
  readonly description: string;
}

type PromptableWorkspaceType = Exclude<WorkspaceType, 'SEQUENCE'>;

const PROMPT_DETAILS: Record<PromptableWorkspaceType, PromptDetails> = {
  DATA: {
    description: 'The prompt can access content from this workspace returned by the similarity search.',
    promptCls: ChatQuestionAnswerPromptTemplate,
    defaultInputValues: {
      domain: 'Testing',
      context: ['Source document #1', 'Source document #2'].join('\n\n'),
      question: 'Do you like prompt engineering?',
    },
  },
  REQUEST_RESPONSE: {
    description:
      'The prompt can access chat history if necessary, for example to condense the history and new question into a single context-aware question.',
    promptCls: ChatCondenseQuestionPromptTemplate,
    defaultInputValues: {
      domain: 'Testing',
      chat_history: [
        { type: 'human', content: 'What is prompt engineering?' },
        {
          type: 'ai',
          content: 'Prompt engineering fine-tunes language models for specific tasks using targeted questions.',
        },
      ] as any,
      question: 'How is this different from other engineering?',
    },
  },
  ROUTER: {
    description:
      'The prompt must select between possible workspaces, and return a JSON object with a workspaceId for the selected workspace.',
    promptCls: ChatRouterPromptTemplate, // TODO create router prompt template...
    defaultInputValues: {
      question: 'Do you like prompt engineering?',
    },
  },
};

export const WorkspacePromptEditor: FC<WorkspacePromptEditorProps> = ({
  workspaceType,
  promptTemplate,
  setPromptTemplate,
  additionalPromptInputs,
}) => {
  const { getAuthenticatedUser } = useCognitoAuthContext();

  const promptDetails = useMemo(
    () => PROMPT_DETAILS[workspaceType as keyof typeof PROMPT_DETAILS] as PromptDetails | undefined,
    [workspaceType],
  );

  const user = useMemo(() => getAuthenticatedUser(), [getAuthenticatedUser]);

  return promptDetails ? (
    <FormField label="Prompt Template" stretch description={promptDetails.description}>
      <PromptEditor
        promptCls={promptDetails.promptCls}
        value={promptTemplate}
        onChange={setPromptTemplate}
        defaultInputValues={{
          ...promptDetails.defaultInputValues,
          ...(additionalPromptInputs ?? {}),
          user: {
            username: user?.getUsername?.() ?? 'username',
          },
        }}
      />
    </FormField>
  ) : null;
};
