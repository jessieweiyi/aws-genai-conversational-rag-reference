/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import Select, { SelectProps } from '@cloudscape-design/components/select';
import { ChatModel } from 'api-typescript-react-query-hooks';
import { startCase } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useFoundationModelInventory } from '../../../hooks/llm-inventory';

export const CUSTOM_VALUE = '::CUSTOM::';

export interface ModelSelectorProps {
  readonly value?: ChatModel;
  readonly onChange: (value: ChatModel) => void;
  readonly none?: boolean;
  readonly noneLabel?: string;
  readonly noneValue?: any;
  readonly custom?: boolean;
  readonly customLabel?: string;
  readonly customValue?: any;
}

export const ChatModelSelector = (props: ModelSelectorProps) => {
  const inventory = useFoundationModelInventory();

  const options = useMemo<SelectProps.Option[] | undefined>(() => {
    if (inventory) {
      const _options: SelectProps.Option[] = Object.values(inventory.models).map((model) => ({
        label: model.name || startCase(model.uuid),
        value: model.uuid,
        tags: [model.framework.type, model.modelId],
        labelTag: model.uuid === inventory.defaultModelId ? 'Default' : undefined,
      }));

      if (props.none) {
        _options.unshift({
          label: '-',
          value: props.noneValue,
          labelTag: props.noneLabel ?? 'None',
        });
      }

      if (props.custom) {
        _options.push({
          label: props.customLabel ?? 'Custom',
          value: props.customValue ?? CUSTOM_VALUE,
          description: 'Integrate with external model',
          labelTag: 'Custom',
        });
      }

      return _options;
    } else {
      return;
    }
  }, [inventory, props.none, props.noneLabel, props.noneValue, props.custom, props.customLabel, props.customValue]);

  useEffect(() => {
    if (!props.value && options) {
      const _value = props.none ? props.noneValue : inventory?.defaultModelId;
      const defaultOption = options.find(
        (v) => v.value === _value || (_value && typeof _value === 'object' && v.value === (_value as any).value),
      );
      defaultOption &&
        props.onChange({
          modelId: defaultOption.value || '',
          name: defaultOption.label || '',
        });
    }
  }, [props.value, options]);

  return (
    <Select
      statusType={options ? 'finished' : 'loading'}
      selectedOption={
        props.value
          ? {
              label: props.value.name,
              value: props.value.modelId,
            }
          : null
      }
      onChange={({ detail }) =>
        props.onChange({
          modelId: detail.selectedOption.value || '',
          name: detail.selectedOption.label || '',
        })
      }
      options={options}
    />
  );
};
