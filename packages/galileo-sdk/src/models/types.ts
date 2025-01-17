/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

import { IModelAdapter } from './adapter.js';

export type Dict = Record<string, unknown>;
export type Kwargs = Record<string, unknown>;

export enum ModelFramework {
  SAGEMAKER_ENDPOINT = 'SageMakerEndpoint',
  BEDROCK = 'Bedrock',
}

export type ModelFrameworks = `${ModelFramework}`;

export interface ISageMakerEndpointModelFramework {
  readonly type: ModelFramework.SAGEMAKER_ENDPOINT;
  readonly endpointName: string;
  readonly endpointRegion: string;
  /** Role to assume to invoke endpoint (cross-account support) */
  readonly role?: string;
  /** Default model kwargs used to call the model */
  readonly modelKwargs?: Kwargs;
  /** Default endpoint kwargs to call the endpoint */
  readonly endpointKwargs?: Kwargs;
}

export interface IBedrockFramework {
  readonly type: ModelFramework.BEDROCK;
  /** Bedrock model id */
  readonly modelId: string;
  /** Bedrock region */
  readonly region: string;
  /** Role to assume to invoke endpoint (cross-account support) */
  readonly role?: string;
  /** Default model kwargs used to call the model */
  readonly modelKwargs?: Kwargs;
  /** Override the endpoint url for service */
  readonly endpointUrl?: string;
}

export type IModelFramework = IBedrockFramework | ISageMakerEndpointModelFramework;

export interface IModelConstraints {
  /**
   * @default `maxTotalTokens - 1`
   */
  readonly maxInputLength?: number;
  readonly maxTotalTokens: number;
}

export interface IBaseModelInfo {
  /** Unique model identifier within application */
  readonly uuid: string;

  /** Canonical id of the model - such as "OpenAssistant/falcon-40b-sft-top1-560" */
  readonly modelId: string;

  /**
   * Human-readable name of the model used in display
   * @default undefined - uuid will likely be used in formatted way as display
   */
  readonly name?: string;
}

export interface IModelInfo extends IBaseModelInfo {
  /** Model frameworks which defines details on invoking the model based on framework specifics */
  readonly framework: IModelFramework;

  /** Constraints consumers must be aware of to call the model, such as max tokens. */
  readonly constraints?: IModelConstraints;

  /** Model adapter spec */
  readonly adapter?: IModelAdapter;
}

export const MANAGED_DEFAULT = '@galileo/managed-default';

export interface IEmbeddingModelInfo extends IBaseModelInfo {
  // TODO: placeholder for supporting additional embedding model providers
  /** Model frameworks which defines details on invoking the model based on framework specifics */
  // readonly framework?: IModelFramework;
  // /** Model adapter spec */
  // readonly adapter?: IEmbeddingModelAdapter;

  /** Dimension such as vector size of the embeddings */
  readonly dimensions: number;
  /**
   * Indicates if this is the default model
   */
  default?: boolean;

  /**
   * Reference key such as natural language type that model supports
   */
  readonly modelRefKey: string;
}

export function isManagedDefaultFramework(framework?: IModelFramework): framework is ISageMakerEndpointModelFramework {
  return framework?.type === ModelFramework.SAGEMAKER_ENDPOINT;
}

export function isSageMakerEndpointFramework(
  framework?: IModelFramework,
): framework is ISageMakerEndpointModelFramework {
  return framework?.type === ModelFramework.SAGEMAKER_ENDPOINT;
}

export function isBedrockFramework(framework?: IModelFramework): framework is IBedrockFramework {
  return framework?.type === ModelFramework.BEDROCK;
}
