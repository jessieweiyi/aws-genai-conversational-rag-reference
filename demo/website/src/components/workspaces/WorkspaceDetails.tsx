/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { KeyValuePair } from '@aws-northstar/ui';
import { useAppLayoutContext } from '@aws-northstar/ui/components/AppLayout';
import {
  Button,
  ColumnLayout,
  Container,
  ContentLayout,
  Form,
  Header,
  Modal,
  SpaceBetween,
  Spinner,
} from '@cloudscape-design/components';
import { useDeleteWorkspace, useGetWorkspace } from 'api-typescript-react-query-hooks';
import { FC, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataImportStatusIndicator } from './components/DataImportStatusIndicator';
import { WorkspaceTypeBadge } from './components/WorkspaceTypeBadge';
import { CodeEditor } from '../../components/code-editor';
import { Error } from '../../components/error';

export interface WorkspaceProps {}

export const WorkspaceDetails: FC<WorkspaceProps> = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const workspace = useGetWorkspace({ workspaceId: workspaceId! });

  const deleteWorkspace = useDeleteWorkspace();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const { setContentType, setSplitPanelProps } = useAppLayoutContext();
  useEffect(() => {
    setContentType('default');
    setSplitPanelProps(undefined);
  }, [setContentType, setSplitPanelProps]);

  const onDeleteWorkspace = useCallback(async () => {
    await deleteWorkspace.mutateAsync({ workspaceId: workspaceId! });
    navigate('/workspaces');
  }, [workspaceId, navigate]);

  if (workspace.isError) {
    return <Error errors={[workspace.error]} />;
  }

  return !workspace.isLoading && workspace.data ? (
    <ContentLayout
      header={
        <Header
          actions={
            <SpaceBetween size="m" direction="horizontal">
              <Button variant="normal" onClick={() => navigate(`/workspaces/${workspaceId}/edit`)}>
                Edit
              </Button>
              <Button variant="normal" onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </SpaceBetween>
          }
          variant="h1"
        >
          {workspace.data.name}
        </Header>
      }
    >
      <Modal
        onDismiss={() => setShowDeleteModal(false)}
        header={<Header variant="h2">Delete Workspace</Header>}
        visible={showDeleteModal}
      >
        <Form
          actions={
            <SpaceBetween size="m" direction="horizontal">
              <Button variant="normal" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" loading={deleteWorkspace.isLoading} onClick={onDeleteWorkspace}>
                Delete
              </Button>
            </SpaceBetween>
          }
        >
          Are you sure you wish to delete {workspace.data.name}?
        </Form>
      </Modal>
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <SpaceBetween size="l">
            <KeyValuePair label="Type" value={<WorkspaceTypeBadge workspaceType={workspace.data.type} />} />
            <ColumnLayout columns={3} borders="vertical">
              <KeyValuePair
                label="Data Import Status"
                value={<DataImportStatusIndicator workspace={workspace.data} />}
              />
            </ColumnLayout>
            <Header variant="h3">Prompt Template</Header>
            <CodeEditor
              readonly
              language="handlebars"
              value={workspace.data.prompt?.promptTemplate || ''}
              editorContentHeight={390}
            />
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  ) : (
    <Spinner size="large" />
  );
};
