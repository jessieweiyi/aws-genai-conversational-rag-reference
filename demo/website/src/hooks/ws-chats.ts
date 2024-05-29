/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { ModelFramework } from '@aws/galileo-sdk/lib/models/types';
import { ChatMessage } from 'api-typescript-react-query-hooks';
import { nanoid } from 'nanoid';
import { useImmer } from 'use-immer';
import { UpdateInferenceStatusRequestContent } from 'ws-api-typescript-websocket-client';
import { useOnStreamLLMResponse, useOnUpdateInferenceStatus } from 'ws-api-typescript-websocket-hooks';
import { useFoundationModelInventory } from './llm-inventory';
import { useFeatureFlag, FEATURE_FLAG_STREAMING } from '..//providers/FlagsProvider';
import { useChatEngineConfig } from '../providers/ChatEngineConfig';

export function useUseStreaming() {
  const [options] = useChatEngineConfig();
  const inventory = useFoundationModelInventory();
  const featureToggleOnStreaming = useFeatureFlag(FEATURE_FLAG_STREAMING);

  const isBedrockFramework =
    options.llm?.model?.uuid &&
    inventory?.models &&
    inventory.models[options.llm.model.uuid]?.framework.type === ModelFramework.BEDROCK;

  const isStreamingResponse =
    featureToggleOnStreaming &&
    isBedrockFramework &&
    (typeof options.llm?.useStreaming === 'undefined' || options.llm?.useStreaming);

  return isStreamingResponse;
}

export interface InprogressMessages {
  human?: ChatMessage;
  ai?: ChatMessage;
  statusUpdates: UpdateInferenceStatusRequestContent[];
}

export const useInprogressMessages = (chatId: string, listMessagesRefetch?: () => Promise<any>) => {
  console.log('useInprogressMessages -- chatId', chatId);
  const [inprogressMessages, updateInprogressMessages] = useImmer<InprogressMessages | null>(null);

  useOnStreamLLMResponse((input) => {
    console.log('onStreamLLMResponse', input);
  }, []);

  useOnUpdateInferenceStatus(async (input) => {
    if (input.chatId === chatId) {
      updateInprogressMessages((draft) => {
        draft?.statusUpdates.push(input);
      });

      if (input.operation === 'HandleSendMessage' && input.status === 'STARTING') {
        updateInprogressMessages((draft) => {
          if (draft == null) {
            draft = {
              ai: { chatId, createdAt: Date.now(), messageId: input.messageId, text: '', type: 'ai' },
              statusUpdates: [],
            };
          }
          draft.human = {
            chatId,
            createdAt: Date.now(),
            messageId: nanoid(32),
            text: input.payload as string,
            type: 'human',
          };
          return draft;
        });
      }

      if (input.operation === 'HandleSendMessage' && input.status === 'SUCCESS') {
        if (listMessagesRefetch) {
          await listMessagesRefetch();
        }
        updateInprogressMessages(() => {
          return null;
        });
      }
    }

    console.log('onUpdateInferenceStatus', input);
  }, []);

  return inprogressMessages;
};
