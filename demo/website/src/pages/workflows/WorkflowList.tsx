/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { FC } from 'react';
import { WorkflowList as WorkflowListComponent } from '../../components/workflows/WorkflowList';

export interface WorkspaceProps {}

export const WorkflowList: FC<WorkspaceProps> = () => {
  return <WorkflowListComponent />;
};
