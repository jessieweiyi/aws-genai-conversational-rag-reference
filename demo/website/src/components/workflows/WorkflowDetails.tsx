/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { useAppLayoutContext } from '@aws-northstar/ui/components/AppLayout';
import {
  Box,
  Button,
  Container,
  ContentLayout,
  Form,
  Header,
  Icon,
  Modal,
  SpaceBetween,
  Spinner,
} from '@cloudscape-design/components';
import { useDeleteWorkflow, useGetWorkflow } from 'api-typescript-react-query-hooks';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBatchGetWorkspaces } from '../../hooks/workspaces';
import { Error } from '../error/Error';

export interface WorkflowProps {}

export const WorkflowDetails: FC<WorkflowProps> = () => {
  const navigate = useNavigate();
  const { workflowId } = useParams<{ workflowId: string }>();
  const workflow = useGetWorkflow({ workflowId: workflowId! });
  const deleteWorkflow = useDeleteWorkflow();

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const workspaces = useBatchGetWorkspaces(workflow.data?.definition.workspaceIds ?? []);
  const workspacesById = useMemo(
    () => Object.fromEntries((workspaces.data ?? []).map((w) => [w.workspaceId, w])),
    [workspaces],
  );

  const { setContentType, setSplitPanelProps } = useAppLayoutContext();
  useEffect(() => {
    setContentType('default');
    setSplitPanelProps(undefined);
  }, [setContentType, setSplitPanelProps]);

  const onDeleteWorkflow = useCallback(async () => {
    await deleteWorkflow.mutateAsync({ workflowId: workflowId! });
    navigate('/workflows');
  }, [workflowId, navigate]);

  if (workflow.isError) {
    return <Error errors={[workflow.error]} />;
  }

  return !workflow.isLoading && workflow.data ? (
    <>
      <Modal
        onDismiss={() => setShowDeleteModal(false)}
        header={<Header variant="h2">Delete Workflow</Header>}
        visible={showDeleteModal}
      >
        <Form
          actions={
            <SpaceBetween size="m" direction="horizontal">
              <Button variant="normal" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={deleteWorkflow.isLoading} onClick={onDeleteWorkflow}>
                Delete
              </Button>
            </SpaceBetween>
          }
        >
          Are you sure you wish to delete {workflow.data.name}?
        </Form>
      </Modal>
      <ContentLayout
        header={
          <Header
            actions={
              <SpaceBetween size="m" direction="horizontal">
                <Button variant="normal" onClick={() => navigate(`/workflows/${workflowId}/edit`)}>
                  Edit
                </Button>
                <Button variant="normal" onClick={() => setShowDeleteModal(true)}>
                  Delete
                </Button>
              </SpaceBetween>
            }
            variant="h1"
          >
            {workflow.data.name}
          </Header>
        }
      >
        <SpaceBetween size="l">
          <Container header={<Header variant="h2">Workspace Sequence</Header>}>
            {workspaces.isLoading ? (
              <Spinner size="large" />
            ) : (
              <Box textAlign="center" float="left">
                {workflow.data.definition.workspaceIds.map((workspaceId, i) => (
                  <Box key={`${workspaceId}-${i}`}>
                    <Box variant="h5">
                      <Link to={`/workspaces/${workspaceId}`}>{workspacesById[workspaceId]?.name ?? workspaceId}</Link>
                    </Box>
                    {i < workflow.data.definition.workspaceIds.length - 1 ? <Icon name="caret-down" /> : null}
                  </Box>
                ))}
              </Box>
            )}
          </Container>
        </SpaceBetween>
      </ContentLayout>
    </>
  ) : (
    <Spinner size="large" />
  );
};
