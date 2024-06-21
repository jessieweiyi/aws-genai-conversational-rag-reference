/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { FormField, Input, SpaceBetween } from '@cloudscape-design/components';
import { WorkspaceEmbeddingModel, useEmbeddingModelInventory } from 'api-typescript-react-query-hooks';
import { Dispatch, FC, SetStateAction, useEffect } from 'react';
import { EmbeddingModelSelector } from './EmbeddingModelSelector';

export interface EmbeddingSettingsProps {
  readonly embeddingModel?: WorkspaceEmbeddingModel;
  readonly setEmbeddingModel: Dispatch<SetStateAction<WorkspaceEmbeddingModel | undefined>>;
  readonly readonly?: boolean;
}

export const EmbeddingSettings: FC<EmbeddingSettingsProps> = ({ embeddingModel, setEmbeddingModel, readonly }) => {
  const embeddingModelInventory = useEmbeddingModelInventory();

  useEffect(() => {
    if (!embeddingModel && embeddingModelInventory.data?.models) {
      const defaultEmbeddingModel = embeddingModelInventory.data.models.find((x) => x._default);
      if (defaultEmbeddingModel) {
        setEmbeddingModel({
          modelId: defaultEmbeddingModel.modelId,
          dimensions: defaultEmbeddingModel.dimension,
        });
      } else if (embeddingModelInventory.data?.models.length > 0) {
        setEmbeddingModel({
          modelId: embeddingModelInventory.data.models[0].modelId,
          dimensions: embeddingModelInventory.data.models[0].dimension,
        });
      }
    }
  }, [embeddingModel, embeddingModelInventory.data?.models]);

  return (
    <SpaceBetween size="l">
      <FormField label="Embedding Model" description="Select the embedding model for vector embeddings" stretch>
        <EmbeddingModelSelector
          models={embeddingModelInventory.data?.models}
          value={embeddingModel?.modelId}
          onChange={(value) =>
            setEmbeddingModel((prev) => ({
              ...prev!,
              modelId: value.selectedOption.value!,
            }))
          }
          readonly={readonly}
        />
      </FormField>
      <FormField label="Dimension" stretch>
        <Input
          type="number"
          value={String(embeddingModel?.dimensions || 768)}
          onChange={({ detail }) => {
            setEmbeddingModel((prev) => ({
              ...prev!,
              dimensions: parseInt(detail.value),
            }));
          }}
          disabled={readonly}
        />
      </FormField>
    </SpaceBetween>
  );
};
