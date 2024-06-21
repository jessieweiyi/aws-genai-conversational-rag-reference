/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { ModelFramework } from '@aws/galileo-sdk/lib/models/types';
import FormField from '@cloudscape-design/components/form-field';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Toggle from '@cloudscape-design/components/toggle';
import { ChatModel } from 'api-typescript-react-query-hooks';
import React, { FC, useMemo } from 'react';
import { useFoundationModelInventory } from '../../../hooks/llm-inventory';
import { useFeatureFlag, FEATURE_FLAG_STREAMING } from '../../../providers/FlagsProvider';
import { toCodeEditorJson, fromCodeEditorJson } from '../../../utils/codeEditor';
import CodeEditor from '../../code-editor';
import { ChatModelSelector } from '../components/ChatModelSelector';

export interface InferenceSettingsProps {
  chatModel?: ChatModel;
  setChatModel: React.Dispatch<React.SetStateAction<ChatModel | undefined>>;
}

export const InferenceSettings: FC<InferenceSettingsProps> = ({ chatModel, setChatModel }) => {
  const inventory = useFoundationModelInventory();
  const featureToggleOnStreaming = useFeatureFlag(FEATURE_FLAG_STREAMING);

  const isBedrockFramework = useMemo(() => {
    return (
      chatModel?.modelId &&
      inventory?.models &&
      inventory.models[chatModel.modelId]?.framework.type === ModelFramework.BEDROCK
    );
  }, [chatModel, inventory]);

  return (
    <SpaceBetween direction="vertical" size="l">
      <ChatModelSelector value={chatModel} onChange={setChatModel} custom={false} />
      {featureToggleOnStreaming && isBedrockFramework && (
        <FormField label="Response Streaming" stretch>
          <Toggle
            checked={chatModel?.useStreaming || false}
            onChange={({ detail }) => {
              setChatModel((prev) => ({
                ...prev!,
                useStreaming: detail.checked,
              }));
            }}
          >
            Stream Response
          </Toggle>
        </FormField>
      )}
      <FormField label="Model Kwargs" stretch>
        <CodeEditor
          language="json"
          value={toCodeEditorJson(chatModel?.modelKwargs || {})}
          onDelayedChange={({ detail }) => {
            try {
              if (detail.value.length) {
                const value = fromCodeEditorJson(detail.value, {});
                setChatModel((prev) => ({
                  ...prev!,
                  modelKwargs: value,
                }));
              }
            } catch (error) {
              console.warn('Failed to parse `LLM Model Kwargs`', detail.value, error);
            }
          }}
        />
      </FormField>
      <FormField label="Model Endpoint Kwargs" stretch>
        <CodeEditor
          language="json"
          value={toCodeEditorJson(chatModel?.endpointKwargs || {})}
          onDelayedChange={({ detail }) => {
            try {
              if (detail.value.length) {
                const value = fromCodeEditorJson(detail.value, {});
                setChatModel((prev) => ({
                  ...prev!,
                  endpointKwargs: value,
                }));
              }
            } catch (error) {
              console.warn('Failed to parse `LLM Endpoint Kwargs`', detail.value, error);
            }
          }}
        />
      </FormField>
    </SpaceBetween>
  );
};
