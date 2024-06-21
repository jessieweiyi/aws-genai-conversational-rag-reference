/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Header, SpaceBetween, Button, Form, Container, FormField, Input } from '@cloudscape-design/components';
import { Workflow, CreateWorkflowRequestContent } from 'api-typescript-react-query-hooks';
import { FC, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceSequenceEditor } from '../workspaces/components/WorkspaceSequenceEditor';

export interface WorkflowFormProps {
  readonly workflow?: Workflow;
  readonly onSubmit: (workflow: CreateWorkflowRequestContent) => Promise<void>;
}

export const WorkflowForm: FC<WorkflowFormProps> = ({ workflow, onSubmit }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [workflowName, setWorkflowName] = useState<string>(workflow?.name || '');
  const [workspaceIds, setWorkspaceIds] = useState<string[]>(workflow?.definition.workspaceIds || []);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    await onSubmit({
      name: workflowName,
      definition: {
        workspaceIds,
      },
    });
    setIsSubmitting(false);
  }, [onSubmit, workflowName, workspaceIds]);

  const isValid = useMemo(
    () => workflowName && workspaceIds.length > 0 && workspaceIds.every((w) => w),
    [workflowName, workspaceIds],
  );

  return (
    <Form
      header={<Header variant="h1">{workflow ? 'Edit' : 'Create'} Workflow</Header>}
      variant="full-page"
      actions={
        <SpaceBetween direction="horizontal" size="m">
          <Button onClick={() => navigate(`/workflows${workflow ? `/${workflow.workflowId}` : ''}`)}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!isValid} loading={isSubmitting}>
            Submit
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <SpaceBetween size="l">
            <FormField label="Workflow Name">
              <Input type="text" value={workflowName} onChange={(e) => setWorkflowName(e.detail.value)} />
            </FormField>
            <FormField label="Workflow Sequence" description="Select the workspaces to handle a chat request, in order">
              <WorkspaceSequenceEditor workspaceIds={workspaceIds} setWorkspaceIds={setWorkspaceIds} />
            </FormField>
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
};
