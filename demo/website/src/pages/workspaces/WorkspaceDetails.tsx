/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { FC } from 'react';
import { WorkspaceDetails } from '../../components/workspaces/WorkspaceDetails';

export interface WorkspaceProps {}

export const Workspace: FC<WorkspaceProps> = () => {
  return <WorkspaceDetails />;
};
