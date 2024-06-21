/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { useAppLayoutContext } from '@aws-northstar/ui/components/AppLayout';
import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceListComponent from '../../components/workspaces/WorkspaceList';

const WorkspaceList: FC = () => {
  const navigate = useNavigate();
  const { setContentType, setSplitPanelProps } = useAppLayoutContext();

  useEffect(() => {
    setContentType('table');
    setSplitPanelProps(undefined);
  }, [setContentType, setSplitPanelProps]);

  return (
    <WorkspaceListComponent
      onWorkspaceIdClick={(workspaceId) => navigate(`/workspaces/${workspaceId}`)}
      onWorkspaceCreate={() => navigate('/workspaces/create')}
    />
  );
};

export default WorkspaceList;
