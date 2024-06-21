/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Alert, Header, SpaceBetween } from '@cloudscape-design/components';
import { RouterWorkspace, WorkspaceEmbeddingModel, WorkspaceType } from 'api-typescript-react-query-hooks';
import { Dispatch, FC, SetStateAction } from 'react';

import { EmbeddingSettings } from './EmbeddingSettings';
import { WorkspaceRouterSelect } from './WorkspaceRouterSelect';

export interface WorkspaceDescriptorFormProps {
  readonly workspaceType: WorkspaceType;
  readonly routerWorkspaces: RouterWorkspace[];
  readonly setRouterWorkspaces: Dispatch<SetStateAction<RouterWorkspace[]>>;
  readonly embeddingModel?: WorkspaceEmbeddingModel;
  readonly setEmbeddingModel: Dispatch<SetStateAction<WorkspaceEmbeddingModel | undefined>>;
  readonly readonly?: boolean;
}

export const WorkspaceDescriptorForm: FC<WorkspaceDescriptorFormProps> = ({
  workspaceType,
  routerWorkspaces,
  setRouterWorkspaces,
  embeddingModel,
  setEmbeddingModel,
  readonly,
}) => {
  switch (workspaceType) {
    case 'REQUEST_RESPONSE':
      return <></>;
    case 'DATA':
      return (
        <EmbeddingSettings embeddingModel={embeddingModel} setEmbeddingModel={setEmbeddingModel} readonly={readonly} />
      );
    case 'ROUTER':
      return (
        <SpaceBetween size="l">
          <Header variant="h3" description="Configure the workspaces that can be routed to">
            Route Targets
          </Header>
          <WorkspaceRouterSelect workspaces={routerWorkspaces} setWorkspaces={setRouterWorkspaces} />
        </SpaceBetween>
      );
    default:
      return <Alert type="error">Unsupported workspace type {workspaceType}</Alert>;
  }
};
