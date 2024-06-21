/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { InfiniteQuerySelect } from '@aws-northstar/ui';
import { Button, ColumnLayout, FormField, Icon, SpaceBetween } from '@cloudscape-design/components';
import { useListWorkspaces } from 'api-typescript-react-query-hooks';
import { Dispatch, FC, SetStateAction, useMemo } from 'react';
import { workspaceToOption } from './WorkspaceRouterSelect';

export interface WorkspaceSequenceEditorProps {
  readonly workspaceIds: string[];
  readonly setWorkspaceIds: Dispatch<SetStateAction<string[]>>;
}

export const WorkspaceSequenceEditor: FC<WorkspaceSequenceEditorProps> = ({ workspaceIds, setWorkspaceIds }) => {
  const workspacesQuery = useListWorkspaces({});

  const allWorkspaces = useMemo(
    () => (workspacesQuery.data?.pages ?? []).flatMap((p) => p.workspaces),
    [workspacesQuery],
  );
  const workspacesById = useMemo(
    () => Object.fromEntries(allWorkspaces.map((w) => [w.workspaceId, w])),
    [allWorkspaces],
  );

  return (
    <SpaceBetween size="l">
      {workspaceIds.map((workspaceId, i) => (
        <SpaceBetween key={`${workspaceId}-${i}`} size="l">
          <ColumnLayout columns={3}>
            <FormField label="Workspace">
              <InfiniteQuerySelect
                query={workspacesQuery}
                itemsKey="workspaces"
                toOption={workspaceToOption}
                selectedOption={workspacesById[workspaceId] ? workspaceToOption(workspacesById[workspaceId]) : null}
                onChange={(e) =>
                  setWorkspaceIds((prev) => [...prev.slice(0, i), e.detail.selectedOption.value!, ...prev.slice(i + 1)])
                }
              />
            </FormField>
            <Button
              iconName="close"
              variant="icon"
              onClick={() => setWorkspaceIds((prev) => [...prev.slice(0, i), ...prev.slice(i + 1)])}
            ></Button>
          </ColumnLayout>
          {i < workspaceIds.length - 1 ? <Icon name="caret-down" /> : null}
        </SpaceBetween>
      ))}
      <Button onClick={() => setWorkspaceIds((prev) => [...prev, allWorkspaces[0]?.workspaceId ?? ''])}>
        Add Workspace
      </Button>
    </SpaceBetween>
  );
};
