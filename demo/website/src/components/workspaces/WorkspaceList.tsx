/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { InfiniteQueryTable } from '@aws-northstar/ui/components';

import { Box, Button, Header, Link, SpaceBetween, TableProps } from '@cloudscape-design/components';
import { useListWorkspaces, Workspace } from 'api-typescript-react-query-hooks';
import { FC, useMemo } from 'react';
import { DataImportStatusIndicator } from './components/DataImportStatusIndicator';
import { Error } from '../error/Error';

export interface WorkspaceListProps {
  onWorkspaceIdClick: (workspaceId: string) => void;
  onWorkspaceCreate: () => void;
}

const WorkspaceList: FC<WorkspaceListProps> = ({ onWorkspaceIdClick, onWorkspaceCreate }) => {
  const workspaces = useListWorkspaces(
    {},
    {
      refetchOnWindowFocus: false,
    },
  );

  const columnDefinitions = useMemo<TableProps.ColumnDefinition<Workspace>[]>(
    () => [
      {
        id: 'workspaceId',
        header: 'Workspace',
        cell: (cell) => (
          <Link
            href={`/workspaces/${cell.workspaceId}`}
            onFollow={(e) => {
              e.preventDefault();
              onWorkspaceIdClick(cell.workspaceId);
            }}
          >
            {cell.name}
          </Link>
        ),
        sortingField: 'workspaceId',
      },
      {
        id: 'type',
        header: 'Workspace Type',
        cell: (cell) => cell.type,
        sortingField: 'type',
      },
      {
        id: 'dataImportStatus',
        header: 'Data Import Status',
        cell: (cell) => <DataImportStatusIndicator workspace={cell} />,
      },
      {
        id: 'chatModel',
        header: 'Chat Model',
        cell: (cell) => cell.chatModel?.name,
      },
      {
        id: 'createdAt',
        header: 'Created At',
        cell: (cell) => (cell.createdAt && new Date(cell.createdAt).toLocaleString()) || '',
        sortingField: 'createdAt',
      },
    ],
    [onWorkspaceIdClick],
  );

  return (
    <InfiniteQueryTable
      query={workspaces}
      itemsKey="workspaces"
      clientSideSort={{
        defaultSortingColumn: {
          sortingField: 'createdAt',
        },
        defaultSortingDescending: true,
      }}
      clientSideTextFilter={{
        filterFunction: (text: string, item: Workspace) => item.name.toLowerCase().includes(text.toLowerCase()),
      }}
      variant="full-page"
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween size="s" direction="horizontal">
              <Button variant="icon" iconName="refresh" onClick={() => void workspaces.refetch()} />
              <Button variant="primary" onClick={() => onWorkspaceCreate()}>
                Create Workspace
              </Button>
            </SpaceBetween>
          }
        >
          Workspaces
        </Header>
      }
      columnDefinitions={columnDefinitions}
      empty={
        <Box textAlign="center" color="inherit">
          {workspaces.isError ? (
            <Error errors={[workspaces.error]} />
          ) : (
            <>
              <b>No resources</b>
              <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                No workspaces to display.
              </Box>
            </>
          )}
        </Box>
      }
    />
  );
};

export default WorkspaceList;
