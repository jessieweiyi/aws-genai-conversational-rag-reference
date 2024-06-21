/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { FC } from 'react';
import { WorkflowDetails as WorkflowDetailsComponent } from '../../components/workflows/WorkflowDetails';

export interface WorkspaceProps {}

export const WorkflowDetails: FC<WorkspaceProps> = () => {
  return <WorkflowDetailsComponent />;
};
