/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { InfiniteQuerySelect } from '@aws-northstar/ui';
import { Button, Form, FormField, Input, SelectProps, SpaceBetween } from '@cloudscape-design/components';
import { ChatFlowType, CreateChatRequestContent, Workflow, Workspace } from 'api-typescript-react-query-hooks';
import { FC, useMemo, useState } from 'react';
import { useListWorkflowsAndWorkspaces } from '../../../hooks/workspaces';

const DEFAULT_WORKFLOW_ID = 'wf-default-structured-unstructured';

export interface CreateChatFormProps {
  readonly isSubmitting: boolean;
  readonly onSubmit: (chat: CreateChatRequestContent) => void;
  readonly onCancel: () => void;
}

const workflowOrWorkspaceToOption = (w: Workflow | Workspace): SelectProps.Option => {
  const type: ChatFlowType = `workflowId` in w ? 'WORKFLOW' : 'WORKSPACE';
  return {
    label: w.name,
    description: type,
    value: `workflowId` in w ? w.workflowId : w.workspaceId,
  };
};

export const CreateChatForm: FC<CreateChatFormProps> = ({ isSubmitting, onSubmit, onCancel }) => {
  const [chat, setChat] = useState<CreateChatRequestContent>({
    workflow: { id: DEFAULT_WORKFLOW_ID, type: 'WORKFLOW' },
    title: 'New Chat - ' + new Date().toLocaleString(),
  });
  const workflowsAndWorkspaces = useListWorkflowsAndWorkspaces();

  const allWorkflowsAndWorkspaces = useMemo(
    () => (workflowsAndWorkspaces.data?.pages ?? []).flatMap((p) => p.workflowsAndWorkspaces),
    [workflowsAndWorkspaces],
  );
  const workflowsAndWorkspacesById = useMemo(
    () =>
      Object.fromEntries(allWorkflowsAndWorkspaces.map((w) => ['workspaceId' in w ? w.workspaceId : w.workflowId, w])),
    [allWorkflowsAndWorkspaces],
  );
  const selectedWorkflowOrWorkspace: Workflow | Workspace | undefined = useMemo(
    () => workflowsAndWorkspacesById[chat?.workflow?.id ?? DEFAULT_WORKFLOW_ID],
    [workflowsAndWorkspacesById, chat?.workflow?.id],
  );

  return (
    <Form
      actions={
        <SpaceBetween size="s" direction="horizontal">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" loading={isSubmitting} onClick={() => onSubmit(chat)}>
            Create Chat
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        <FormField label="Title">
          <Input
            type="text"
            value={chat.title}
            onChange={(e) => setChat((prev) => ({ ...prev, title: e.detail.value }))}
          />
        </FormField>
        <FormField label="Workflow/Workspace">
          <InfiniteQuerySelect
            query={workflowsAndWorkspaces}
            itemsKey="workflowsAndWorkspaces"
            selectedOption={
              selectedWorkflowOrWorkspace ? workflowOrWorkspaceToOption(selectedWorkflowOrWorkspace) : null
            }
            toOption={workflowOrWorkspaceToOption}
            // TODO: Consider selection of workspace...
            onChange={(e) =>
              setChat((prev) => ({
                ...prev,
                workflow: {
                  id: e.detail.selectedOption.value!,
                  type: e.detail.selectedOption.description! as ChatFlowType,
                },
              }))
            }
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );
};
