/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Badge } from '@cloudscape-design/components';
import { WorkspaceType } from 'api-typescript-react-query-hooks';
import { FC } from 'react';

export interface WorkspaceTypeBadgeProps {
  readonly workspaceType: WorkspaceType;
}

export const WorkspaceTypeBadge: FC<WorkspaceTypeBadgeProps> = ({ workspaceType }) => {
  switch (workspaceType) {
    case 'DATA':
      return <Badge color="green">Data</Badge>;
    case 'REQUEST_RESPONSE':
      return <Badge color="blue">Request Response</Badge>;
    case 'ROUTER':
      return <Badge color="grey">Router</Badge>;
  }
};
