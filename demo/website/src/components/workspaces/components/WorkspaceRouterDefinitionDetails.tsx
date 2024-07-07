/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { KeyValuePair } from '@aws-northstar/ui';
import { Container, Header, SpaceBetween, Link, Grid } from '@cloudscape-design/components';
import { RouterWorkspaceDefinition, useListWorkspaces } from 'api-typescript-react-query-hooks';
import { FC, useMemo } from 'react';

export interface WorkspaceRouterDefinitionDetailsProps {
  routerDefinition: RouterWorkspaceDefinition;
}

export const WorkspaceRouterDefinitionDetails: FC<WorkspaceRouterDefinitionDetailsProps> = ({ routerDefinition }) => {
  const workspacesQuery = useListWorkspaces({});

  const allWorkspaces = useMemo(
    () => (workspacesQuery.data?.pages ?? []).flatMap((p) => p.workspaces),
    [workspacesQuery],
  );

  return (
    <Container header={<Header variant="h2">Router definitions</Header>}>
      <SpaceBetween size="l">
        {routerDefinition.workspaces.map((ws) => (
          <Grid key={ws.id} gridDefinition={[{ colspan: 3 }, { colspan: 9 }]}>
            <KeyValuePair
              label="Workspace"
              value={<Link href={ws.id}>{allWorkspaces.find((w) => w.workspaceId === ws.id)?.name}</Link>}
            />
            <KeyValuePair label="Content Hint" value={ws.description} />
          </Grid>
        ))}
      </SpaceBetween>
    </Container>
  );
};
