/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { useAppLayoutContext } from '@aws-northstar/ui/components/AppLayout';
import { Spinner } from '@cloudscape-design/components';
import { UpdateWorkspaceRequestContent, useGetWorkspace, useUpdateWorkspace } from 'api-typescript-react-query-hooks';
import { FC, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WorkspaceForm from '../../components/workspaces/WorkspaceForm';

export interface UpdateWorkspaceProps {}

export const UpdateWorkspace: FC<UpdateWorkspaceProps> = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { setContentType, setSplitPanelProps } = useAppLayoutContext();
  useEffect(() => {
    setContentType('form');
    setSplitPanelProps(undefined);
  }, [setContentType, setSplitPanelProps]);

  const workspace = useGetWorkspace({ workspaceId: workspaceId! });

  const updateWorkspace = useUpdateWorkspace();

  const submit = useCallback(
    async (updatedWorkspace: UpdateWorkspaceRequestContent) => {
      const ws = await updateWorkspace.mutateAsync({
        workspaceId: workspaceId!,
        updateWorkspaceRequestContent: {
          ...updatedWorkspace,
        },
      });
      navigate(`/workspaces/${ws.workspaceId}`);
    },
    [updateWorkspace, navigate, workspaceId],
  );

  return workspace.isLoading || !workspace.data ? (
    <Spinner size="large" />
  ) : (
    <WorkspaceForm workspace={workspace.data} onSubmit={submit} />
  );
};
