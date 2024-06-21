/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import Select, { SelectProps } from '@cloudscape-design/components/select';
import { EmbeddingModel } from 'api-typescript-react-query-hooks';

import { FC, useMemo } from 'react';

export interface EmbeddingModelSelectorProps {
  readonly models?: EmbeddingModel[];
  readonly value?: string;
  readonly onChange: (value: SelectProps.ChangeDetail) => void;
  readonly readonly?: boolean;
}

export const EmbeddingModelSelector: FC<EmbeddingModelSelectorProps> = ({ models, value, onChange, readonly }) => {
  const embeddingModels = useMemo<SelectProps.Option[] | undefined>(() => {
    if (models) {
      const options: SelectProps.Option[] = models.map((model) => ({
        label: model.modelId,
        value: model.modelId,
      }));
      return options;
    }

    return [];
  }, [models]);

  const selectedModel = useMemo<SelectProps.Option | null>(() => {
    if (embeddingModels) {
      const embeddingModel = embeddingModels.find((model) => model.value === value);
      return embeddingModel || null;
    }
    return null;
  }, [embeddingModels, value]);

  return (
    <Select
      statusType={embeddingModels ? 'finished' : 'loading'}
      selectedOption={selectedModel}
      onChange={({ detail }) => onChange(detail)}
      options={embeddingModels}
      disabled={readonly}
    />
  );
};
