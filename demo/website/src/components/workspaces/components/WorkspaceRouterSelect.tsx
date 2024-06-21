/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { InfiniteQuerySelect } from '@aws-northstar/ui';
import { Button, ColumnLayout, FormField, SelectProps, SpaceBetween, Textarea } from '@cloudscape-design/components';
import { RouterWorkspace, Workspace, useListWorkspaces } from 'api-typescript-react-query-hooks';
import { Dispatch, FC, SetStateAction, useCallback, useMemo } from 'react';

export interface WorkspaceRouterSelectProps {
  readonly workspaces: RouterWorkspace[];
  readonly setWorkspaces: Dispatch<SetStateAction<RouterWorkspace[]>>;
}

export const workspaceToOption = (workspace: Workspace): SelectProps.Option => ({
  value: workspace.workspaceId,
  label: workspace.name,
  description: workspace.type,
});

export const WorkspaceRouterSelect: FC<WorkspaceRouterSelectProps> = ({ workspaces, setWorkspaces }) => {
  const workspacesQuery = useListWorkspaces({});

  const allWorkspaces = useMemo(
    () => (workspacesQuery.data?.pages ?? []).flatMap((p) => p.workspaces),
    [workspacesQuery],
  );
  const workspacesById = useMemo(
    () => Object.fromEntries(allWorkspaces.map((w) => [w.workspaceId, w])),
    [allWorkspaces],
  );

  const updateWorkspace = useCallback(
    (i: number, value: Partial<RouterWorkspace>) => {
      setWorkspaces((prev) => [...prev.slice(0, i), { ...prev[i], ...value }, ...prev.slice(i + 1)]);
    },
    [setWorkspaces],
  );

  return (
    <SpaceBetween size="l">
      {workspaces.map((w, i) => (
        <ColumnLayout key={`${w.id}-${i}`} columns={3}>
          <FormField
            label="Workspace"
            description="Select a workspace which may be routed to in order to answer a question."
          >
            <InfiniteQuerySelect
              query={workspacesQuery}
              itemsKey="workspaces"
              toOption={workspaceToOption}
              selectedOption={workspacesById[w.id] ? workspaceToOption(workspacesById[w.id]) : null}
              onChange={(e) => updateWorkspace(i, { id: e.detail.selectedOption.value! })}
            />
          </FormField>
          <FormField
            label="Content Hint"
            description="Describe the purpose and content of the workspace to allow the langage model to select the workspace appropriate for a given question."
          >
            <Textarea value={w.description} onChange={(e) => updateWorkspace(i, { description: e.detail.value })} />
          </FormField>
          <Button
            iconName="close"
            variant="icon"
            onClick={() => setWorkspaces((prev) => [...prev.slice(0, i), ...prev.slice(i + 1)])}
          ></Button>
        </ColumnLayout>
      ))}
      <Button
        onClick={() => setWorkspaces((prev) => [...prev, { id: allWorkspaces[0].workspaceId ?? '', description: '' }])}
      >
        Add Workspace
      </Button>
    </SpaceBetween>
  );
};
