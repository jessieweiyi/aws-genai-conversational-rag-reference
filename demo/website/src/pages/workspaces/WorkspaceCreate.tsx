/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { useAppLayoutContext } from '@aws-northstar/ui/components/AppLayout';
import { CreateWorkspaceRequestContent, useCreateWorkspace } from 'api-typescript-react-query-hooks';
import { FC, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceForm from '../../components/workspaces/WorkspaceForm';

export interface CreateWorkspaceProps {}

export const CreateWorkspace: FC<CreateWorkspaceProps> = () => {
  const navigate = useNavigate();
  const { setContentType, setSplitPanelProps } = useAppLayoutContext();
  useEffect(() => {
    setContentType('form');
    setSplitPanelProps(undefined);
  }, [setContentType, setSplitPanelProps]);

  const createWorkspace = useCreateWorkspace();

  const submit = useCallback(
    async (createWorkspaceRequestContent: CreateWorkspaceRequestContent) => {
      const ws = await createWorkspace.mutateAsync({
        createWorkspaceRequestContent,
      });
      navigate(`/workspaces/${ws.workspaceId}`);
    },
    [navigate],
  );

  return <WorkspaceForm onSubmit={submit} />;
};
