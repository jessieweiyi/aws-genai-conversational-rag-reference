/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { useAppLayoutContext } from '@aws-northstar/ui/components/AppLayout';
import { CreateWorkflowRequestContent, useCreateWorkflow } from 'api-typescript-react-query-hooks';
import { FC, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkflowForm } from '../../components/workflows/WorkflowForm';

export interface CreateWorkflowProps {}

export const CreateWorkflow: FC<CreateWorkflowProps> = () => {
  const navigate = useNavigate();
  const { setContentType, setSplitPanelProps } = useAppLayoutContext();
  useEffect(() => {
    setContentType('form');
    setSplitPanelProps(undefined);
  }, [setContentType, setSplitPanelProps]);

  const createWorkflow = useCreateWorkflow();

  const submit = useCallback(
    async (createWorkflowRequestContent: CreateWorkflowRequestContent) => {
      const ws = await createWorkflow.mutateAsync({
        createWorkflowRequestContent,
      });
      navigate(`/workflows/${ws.workflowId}`);
    },
    [navigate],
  );

  return <WorkflowForm onSubmit={submit} />;
};
