/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { UseQueryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { DefaultApiClientContext, DefaultApiDefaultContext, Workspace } from 'api-typescript-react-query-hooks';
import chunk from 'lodash/chunk';
import { useContext } from 'react';

const BATCH_SIZE = 10;

export const useBatchGetWorkspaces = (
  workspaceIds: string[],
  options?: Omit<UseQueryOptions<Workspace[]>, 'queryFn' | 'queryKey'>,
) => {
  const api = useContext(DefaultApiClientContext);
  if (!api) {
    throw new Error('Api client missing');
  }

  return useQuery<Workspace[]>(
    ['workpaces', ...workspaceIds],
    async () => {
      const workspaces: Workspace[] = [];
      for (const batch of chunk(workspaceIds, BATCH_SIZE)) {
        workspaces.push(...(await Promise.all(batch.map((workspaceId) => api.getWorkspace({ workspaceId })))));
      }
      return workspaces;
    },
    {
      context: DefaultApiDefaultContext as any,
      ...options,
    },
  );
};

export const useListWorkflowsAndWorkspaces = () => {
  const api = useContext(DefaultApiClientContext);
  if (!api) {
    throw new Error('Api client missing');
  }

  return useInfiniteQuery(
    ['listWorkflowsAndWorkspaces'],
    async ({ pageParam }) => {
      const fetchIfApplicable = async <T>(key: string, fetcher: () => Promise<T>) => {
        if (!pageParam || pageParam[key]) {
          return fetcher();
        }
        return undefined;
      };

      const [workflows, workspaces] = await Promise.all([
        fetchIfApplicable('workflows', () => api.listWorkflows({ nextToken: pageParam?.workflows })),
        fetchIfApplicable('workspaces', () => api.listWorkspaces({ nextToken: pageParam?.workspaces })),
      ]);

      return {
        workflows,
        workspaces,
        workflowsAndWorkspaces: [...(workflows?.workflows ?? []), ...(workspaces?.workspaces ?? [])],
      };
    },
    {
      context: DefaultApiDefaultContext as any,
      getNextPageParam: (res) => {
        if (!res.workflows?.nextToken && !res.workspaces?.nextToken) {
          return undefined;
        }
        return {
          workspaces: res.workspaces?.nextToken,
          workflows: res.workflows?.nextToken,
        };
      },
    },
  );
};
