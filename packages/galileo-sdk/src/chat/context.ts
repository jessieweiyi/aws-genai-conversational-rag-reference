/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { SageMakerEndpoint } from '@langchain/community/llms/sagemaker_endpoint';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseLanguageModel } from 'langchain/base_language';
import { merge } from 'lodash';
import { getLogger } from '../common/index.js';
import { ModelAdapter } from '../models/adapter.js';
import { DEFAULT_MAX_NEW_TOKENS } from '../models/constants.js';
import { resolveFoundationModelCredentials } from '../models/cross-account.js';
import { FoundationModelInventory } from '../models/index.js';
import { resolveModelAdapter } from '../models/llms/utils.js';
import { IModelInfo, Kwargs, isBedrockFramework, isSageMakerEndpointFramework } from '../models/types.js';
import { omitManagedBedrockKwargs } from '../utils/bedrock.js';

const logger = getLogger('chat/adapter');

export interface ResolvedLLM {
  llm: BaseLanguageModel;
  modelInfo: IModelInfo;
  adapter: ModelAdapter;
}

export type ResolvableModelInfo = string | IModelInfo | Partial<IModelInfo>;

export interface IChatEngineContextOptions {
  readonly maxNewTokens: number;
  readonly modelKwargs?: Kwargs;
  readonly endpointKwargs?: Kwargs;
  readonly verbose?: boolean;
  readonly prompt: PromptTemplate;
}

export class ChatEngineContext {
  static async resolveModelInfo(modelInfo: ResolvableModelInfo | undefined): Promise<IModelInfo> {
    logger.info('Resolve model info', { modelInfo: modelInfo ?? 'DEFAULT' });

    if (typeof modelInfo === 'string' && modelInfo.startsWith('{')) {
      // Model info defines a custom model that is not deployed with the solution, or override for deployed model
      modelInfo = JSON.parse(modelInfo) as Partial<IModelInfo>;
      logger.info('Custom ModelInfo received', { modelInfo });
    }

    if (typeof modelInfo === 'object' && !modelInfo.uuid) {
      logger.info('No need to resolve model info as partial config received without uuid', { modelInfo });
      // uuid is missing, but that is ok as is only needed for resolve from inventory
      return modelInfo as IModelInfo;
    }

    const uuid = modelInfo == null ? undefined : typeof modelInfo === 'string' ? modelInfo : modelInfo.uuid;
    const resolved = await FoundationModelInventory.getModelOrDefault(uuid);

    modelInfo = typeof modelInfo === 'object' ? (merge({}, resolved, modelInfo) as IModelInfo) : resolved;
    logger.info('Resolving model info from inventory', { uuid, modelInfo, resolved });
    return modelInfo as IModelInfo;
  }

  readonly llm: BaseLanguageModel;
  readonly prompt: PromptTemplate;

  readonly modelInfo: IModelInfo;
  readonly maxNewTokens: number;

  readonly adapter: ModelAdapter;

  constructor(modelInfo: IModelInfo, options: IChatEngineContextOptions) {
    this.modelInfo = modelInfo;
    this.maxNewTokens = options.maxNewTokens;

    logger.debug('LLM configuration', { modelInfo, options });

    this.adapter = resolveModelAdapter(modelInfo);
    logger.debug('ModelAdapter:', {
      isDefault: this.adapter.isDefault,
      adapter: this.adapter.isDefault ? undefined : this.adapter,
    });

    if (isSageMakerEndpointFramework(modelInfo.framework)) {
      const { endpointName, endpointRegion, role } = modelInfo.framework;

      const endpointKwargs = {
        ...modelInfo.framework.endpointKwargs,
        ...options.endpointKwargs,
      };
      const modelKwargs = {
        ...modelInfo.framework.modelKwargs,
        ...options.modelKwargs,
      };
      logger.debug('Resolved sagemaker kwargs', { endpointKwargs, modelKwargs });

      this.llm = new SageMakerEndpoint({
        verbose: options.verbose,
        // Support cross-account endpoint if enabled and provided in env
        // Otherwise default to execution role creds
        clientOptions: {
          region: endpointRegion,
          credentials: resolveFoundationModelCredentials(role),
        },
        endpointName: endpointName,
        contentHandler: this.adapter.contentHandler,
        endpointKwargs,
        modelKwargs,
      });
    } else if (isBedrockFramework(modelInfo.framework)) {
      const { modelId, region, role, endpointUrl } = modelInfo.framework;

      const modelKwargs = {
        maxTokens: DEFAULT_MAX_NEW_TOKENS,
        temperature: 0,
        ...modelInfo.framework.modelKwargs,
        ...options.endpointKwargs,
        ...options.modelKwargs,
      };
      logger.debug('Resolved bedrock kwargs', { modelKwargs });

      this.llm = new BedrockChat({
        verbose: options.verbose,
        // Support cross-account endpoint if enabled and provided in env
        // Otherwise default to execution role credentials
        credentials: resolveFoundationModelCredentials(role),
        model: modelId,
        region,
        endpointUrl,
        ...modelKwargs,
        modelKwargs: omitManagedBedrockKwargs(modelKwargs),
      });
    } else {
      // @ts-ignore
      throw new Error(`Model Framework "${modelInfo.framework.type}" is not supported/implemented`);
    }

    this.prompt = options.prompt;

    logger.debug('Prompt', {
      prompt: this.prompt.serialize(),
    });
  }
}
