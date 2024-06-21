/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import {
  Button,
  Container,
  Form,
  FormField,
  Header,
  Input,
  SpaceBetween,
  Textarea,
} from '@cloudscape-design/components';
import {
  ChatModel,
  CreateWorkspaceRequestContent,
  RouterWorkspace,
  Workspace,
  WorkspaceEmbeddingModel,
  WorkspaceType,
} from 'api-typescript-react-query-hooks';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InferenceSettings } from './components/InferenceSettings';
import { WorkspaceDescriptorForm } from './components/WorkspaceDescriptorForm';
import { WorkspacePromptEditor } from './components/WorkspacePromptEditor';
import { WorkspaceTypeSelector } from './components/WorkspaceTypeSelector';
import { DEFAULT_PROMPTS } from '../../types/defaultPrompts';

export interface WorkspaceFormProps {
  readonly workspace?: Workspace;
  readonly onSubmit: (workspace: CreateWorkspaceRequestContent) => Promise<void>;
}

const WorkspaceForm: FC<WorkspaceFormProps> = ({ workspace, onSubmit }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>(workspace?.type ?? 'DATA');

  const [workspaceName, setWorkspaceName] = useState<string>(workspace?.name ?? '');
  const [workspaceDescription, setWorkspaceDescription] = useState<string>(workspace?.description ?? '');

  const [promptTemplate, setPromptTemplate] = useState<string>(
    workspace?.prompt?.promptTemplate ?? DEFAULT_PROMPTS[workspaceType],
  );

  useEffect(() => {
    // When the workspace type changes, update to the default prompt for that workspace
    if (!workspace) {
      setPromptTemplate(DEFAULT_PROMPTS[workspaceType]);
    }
  }, [workspace, workspaceType, setPromptTemplate]);

  const [embeddingModel, setEmbeddingModel] = useState<WorkspaceEmbeddingModel | undefined>(
    workspace?.data?.indexing?.embeddingModel,
  );

  const [chatModel, setChatModel] = useState<ChatModel | undefined>(workspace?.chatModel);

  const [routerWorkspaces, setRouterWorkspaces] = useState<RouterWorkspace[]>(
    workspace?.routerDefinition?.workspaces ?? [],
  );

  const isValid = useMemo(() => workspaceName && workspaceType, [workspaceName, workspaceType]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: workspaceName,
        description: workspaceDescription,
        type: workspaceType,
        chatModel: chatModel!,
        prompt: {
          promptTemplate: DEFAULT_PROMPTS[workspaceType],
        },
        data:
          workspaceType === 'DATA'
            ? {
                indexing: {
                  vectorStorage: {
                    aurora: {},
                  },
                  embeddingModel: {
                    modelId: embeddingModel?.modelId || '',
                    dimensions: embeddingModel?.dimensions || 768,
                  },
                },
              }
            : undefined,
        routerDefinition:
          workspaceType === 'ROUTER'
            ? {
                workspaces: routerWorkspaces,
              }
            : undefined,
      });
    } catch (e) {
      // Error will appear in notifications
    }
    setIsSubmitting(false);
  }, [
    onSubmit,
    workspaceName,
    workspaceDescription,
    chatModel,
    workspaceType,
    promptTemplate,
    routerWorkspaces,
    embeddingModel,
  ]);

  return (
    <Form
      header={<Header variant="h1">{workspace ? 'Edit' : 'Create'} Workspace</Header>}
      variant="full-page"
      actions={
        <SpaceBetween direction="horizontal" size="m">
          <Button onClick={() => navigate(`/workspaces${workspace ? `/${workspace.workspaceId}` : ''}`)}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!isValid} loading={isSubmitting}>
            Submit
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <SpaceBetween size="l">
            <FormField label="Name" stretch>
              <Input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.detail.value)} />
            </FormField>
            <FormField label="Description" stretch>
              <Textarea value={workspaceDescription} onChange={(e) => setWorkspaceDescription(e.detail.value)} />
            </FormField>
          </SpaceBetween>
        </Container>
        <Container header={<Header variant="h2">Workspace Settings</Header>}>
          <WorkspaceTypeSelector
            selectedType={workspaceType}
            setSelectedType={setWorkspaceType}
            readonly={!!workspace}
          />
          <WorkspaceDescriptorForm
            workspaceType={workspaceType}
            routerWorkspaces={routerWorkspaces}
            setRouterWorkspaces={setRouterWorkspaces}
            embeddingModel={embeddingModel}
            setEmbeddingModel={setEmbeddingModel}
            readonly={workspace && workspace.type !== 'ROUTER'}
          />
        </Container>
        <Container header={<Header variant="h2">Inference</Header>}>
          <InferenceSettings chatModel={chatModel} setChatModel={setChatModel} />
        </Container>
        <Container header={<Header variant="h2">Prompt Engineering</Header>}>
          <SpaceBetween size="l">
            <WorkspacePromptEditor
              workspaceType={workspaceType}
              promptTemplate={promptTemplate}
              setPromptTemplate={setPromptTemplate}
            />
          </SpaceBetween>
        </Container>
      </SpaceBetween>
    </Form>
  );
};

export default WorkspaceForm;
