/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

import { InfiniteQueryTable } from '@aws-northstar/ui/components';
import { useAppLayoutContext } from '@aws-northstar/ui/components/AppLayout';
import { Box, Button, Header, Link, SpaceBetween, TableProps } from '@cloudscape-design/components';
import { useListWorkflows, Workflow } from 'api-typescript-react-query-hooks';
import { FC, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Error } from '../../components/error/Error';

export interface WorkflowsProps {}

export const WorkflowList: FC<WorkflowsProps> = () => {
  const navigate = useNavigate();
  const { setContentType, setSplitPanelProps } = useAppLayoutContext();

  useEffect(() => {
    setContentType('table');
    setSplitPanelProps(undefined);
  }, [setContentType, setSplitPanelProps]);

  const columnDefinitions = useMemo<TableProps.ColumnDefinition<Workflow>[]>(
    () => [
      {
        id: 'workflowId',
        header: 'Workflow',
        cell: (cell) => (
          <Link
            href={`/workflows/${cell.workflowId}`}
            onFollow={(e) => {
              e.preventDefault();
              navigate(`/workflows/${cell.workflowId}`);
            }}
          >
            {cell.name}
          </Link>
        ),
        sortingField: 'workflowId',
      },
      {
        id: 'description',
        header: 'Description',
        cell: (cell) => cell.description,
        sortingField: 'description',
      },
      {
        id: 'createdAt',
        header: 'Created At',
        cell: (cell) => (cell.createdAt && new Date(cell.createdAt).toLocaleString()) || '',
        sortingField: 'createdAt',
      },
    ],
    [navigate],
  );

  const workflows = useListWorkflows(
    {},
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <>
      <InfiniteQueryTable
        query={workflows}
        itemsKey="workflows"
        clientSideSort={{
          defaultSortingColumn: {
            sortingField: 'createdAt',
          },
          defaultSortingDescending: true,
        }}
        clientSideTextFilter={{
          filterFunction: (text, item) => item.name.toLowerCase().includes(text.toLowerCase()),
        }}
        variant="full-page"
        header={
          <Header
            variant="h1"
            actions={
              <SpaceBetween size="s" direction="horizontal">
                <Button variant="icon" iconName="refresh" onClick={() => void workflows.refetch()} />
                <Button variant="primary" onClick={() => navigate('/workflows/create')}>
                  Create Workflow
                </Button>
              </SpaceBetween>
            }
          >
            Workflows
          </Header>
        }
        columnDefinitions={columnDefinitions}
        empty={
          <Box textAlign="center" color="inherit">
            {workflows.isError ? (
              <Error errors={[workflows.error]} />
            ) : (
              <>
                <b>No resources</b>
                <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                  No workflows to display.
                </Box>
              </>
            )}
          </Box>
        }
      />
    </>
  );
};
