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
import { WorkspaceRouterDefinitionDetails } from './components/WorkspaceRouterDefinitionDetails';
import { WorkspaceTypeBadge } from './components/WorkspaceTypeBadge';
import { CodeEditor } from '../../components/code-editor';
import { Error } from '../../components/error';
import { toCodeEditorJson } from '../../utils/codeEditor';

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
            <KeyValuePair label="Description" value={workspace.data.description} />
            <ColumnLayout columns={2} borders="vertical">
              <KeyValuePair
                label="Data import status"
                value={
                  workspace.data.type === 'DATA' ? <DataImportStatusIndicator workspace={workspace.data} /> : 'N/A'
                }
              />
              <KeyValuePair
                label="Created at"
                value={(workspace.data.createdAt && new Date(workspace.data.createdAt).toLocaleString()) || ''}
              />
            </ColumnLayout>
          </SpaceBetween>
        </Container>
        {workspace.data.type === 'DATA' && workspace.data.data?.indexing && (
          <Container header={<Header variant="h2">Data</Header>}>
            <SpaceBetween size="l">
              <KeyValuePair label="Embedding model" value={workspace.data.data.indexing.embeddingModel.modelId} />
              <KeyValuePair label="Dimensions" value={workspace.data.data.indexing.embeddingModel.dimensions} />
            </SpaceBetween>
          </Container>
        )}
        {workspace.data.type === 'ROUTER' && workspace.data.routerDefinition && (
          <WorkspaceRouterDefinitionDetails routerDefinition={workspace.data.routerDefinition} />
        )}
        <Container header={<Header variant="h2">Inference</Header>}>
          <SpaceBetween size="l">
            <KeyValuePair label="Model" value={workspace.data.chatModel.name} />
            <KeyValuePair
              label="Model Kwargs"
              value={
                <CodeEditor
                  readonly
                  language="json"
                  value={toCodeEditorJson(workspace.data.chatModel?.modelKwargs || {})}
                />
              }
            />
            <KeyValuePair
              label="Model endpoint kwargs"
              value={
                <CodeEditor
                  readonly
                  language="json"
                  value={toCodeEditorJson(workspace.data.chatModel?.endpointKwargs || {})}
                />
              }
            />
          </SpaceBetween>
        </Container>
        <Container header={<Header variant="h2">Prompt Template</Header>}>
          <SpaceBetween size="l">
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
