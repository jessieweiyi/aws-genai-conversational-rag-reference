/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Popover, StatusIndicator } from '@cloudscape-design/components';
import { Workspace, WorkspaceDataImport } from 'api-typescript-react-query-hooks';
import { FC } from 'react';

export interface DataImportIndicatorProps {
  readonly dataImport: WorkspaceDataImport;
}

export interface DataImportStatusIndicatorProps {
  readonly workspace: Workspace;
}

const DataImportIndicator: FC<DataImportIndicatorProps> = ({ dataImport }) => {
  console.log(dataImport);
  switch (dataImport.status) {
    case 'NOT_STARTED':
      return (
        <StatusIndicator type="stopped" colorOverride="grey">
          Not Started
        </StatusIndicator>
      );
    case 'IN_PROGRESS':
      return (
        <StatusIndicator type="in-progress" colorOverride="blue">
          In Progress
        </StatusIndicator>
      );
    case 'SUCCESS':
      return <StatusIndicator type="success">Success</StatusIndicator>;
    case 'FAILURE':
    default:
      return (
        <StatusIndicator type="error">
          {dataImport.statusDetails ? (
            <Popover triggerType="text" content={dataImport.statusDetails}>
              Failed
            </Popover>
          ) : (
            'Failed'
          )}
        </StatusIndicator>
      );
  }
};

export const DataImportStatusIndicator: FC<DataImportStatusIndicatorProps> = ({ workspace }) => {
  return workspace.type === 'DATA' && workspace.data && workspace.data?.indexing && workspace.dataImport ? (
    <DataImportIndicator dataImport={workspace.dataImport} />
  ) : (
    <>N/A</>
  );
};
