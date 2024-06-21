/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { useAppLayoutContext } from '@aws-northstar/ui/components/AppLayout';
import { Spinner } from '@cloudscape-design/components';
import { CreateWorkflowRequestContent, useGetWorkflow, useUpdateWorkflow } from 'api-typescript-react-query-hooks';
import { FC, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkflowForm } from '../../components/workflows/WorkflowForm';

export interface UpdateWorkflowProps {}

export const UpdateWorkflow: FC<UpdateWorkflowProps> = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { setContentType, setSplitPanelProps } = useAppLayoutContext();
  useEffect(() => {
    setContentType('form');
    setSplitPanelProps(undefined);
  }, [setContentType, setSplitPanelProps]);

  const workflow = useGetWorkflow({ workflowId: workflowId! });
  const updateWorkflow = useUpdateWorkflow();

  const submit = useCallback(
    async (updatedWorkflow: CreateWorkflowRequestContent) => {
      const ws = await updateWorkflow.mutateAsync({
        workflowId: workflowId!,
        updateWorkflowRequestContent: {
          ...updatedWorkflow,
        },
      });
      navigate(`/workflows/${ws.workflowId}`);
    },
    [updateWorkflow, navigate, workflowId],
  );

  return workflow.isLoading || !workflow.data ? (
    <Spinner size="large" />
  ) : (
    <WorkflowForm workflow={workflow.data} onSubmit={submit} />
  );
};
