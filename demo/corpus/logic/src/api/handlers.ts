/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { getWorkspace } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workspace';
import { PGVectorStoreOptions, distanceStrategyFromValue } from '@aws/galileo-sdk/lib/vectorstores';

import { getPostgresTableNameByWorkspace } from '@aws/galileo-sdk/lib/vectorstores/pgvector/utils';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { corsInterceptor } from 'api-typescript-interceptors';
import {
  Document,
  EmbeddingModel,
  embedDocumentsHandler,
  embedQueryHandler,
  embeddingModelInventoryHandler,
  similaritySearchHandler,
} from 'api-typescript-runtime';
import { findEmbeddingModelByRefKey, getEmbeddingsByModelId } from '../embedding/util';

import { ENV } from '../env';
import { vectorStoreFactory } from '../vectorstore';

const interceptors = [corsInterceptor] as const;

const TABLE_NAME_WORKSPACES = process.env.TABLE_NAME_WORKSPACES!;

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const similaritySearch = similaritySearchHandler(...interceptors, async ({ input }) => {
  const { query, k, filter, distanceStrategy, workspaceId } = input.body;

  // NB: changing distanceStrategy should only be used for development since
  // unless the strategy is also indexes as performance will be slower.
  let vectorStoreConfig: Partial<PGVectorStoreOptions> | undefined;
  if (distanceStrategy) {
    vectorStoreConfig = {
      distanceStrategy: distanceStrategyFromValue(distanceStrategy),
    };
  }

  const workspace = await getWorkspace(documentClient, TABLE_NAME_WORKSPACES, workspaceId);

  if (!workspace) {
    throw new Error(`Unable to locate workspace ${workspaceId}`);
  }

  const embeddingModel = workspace.data?.indexing?.embeddingModel;

  if (!embeddingModel) {
    throw new Error(`Unable to find embeddingModel info for ${workspaceId}`);
  }

  const vectorStore = await vectorStoreFactory({
    embeddingTableName: getPostgresTableNameByWorkspace(workspaceId),
    vectorSize: embeddingModel.dimensions,
    embeddings: getEmbeddingsByModelId(embeddingModel.modelId, {}),
    config: vectorStoreConfig,
  });

  if (query == null || query.length < 1) {
    throw new Error('InvalidPayload: query is required');
  }

  if (input.requestParameters.withScore) {
    const result = await vectorStore.similaritySearchWithScore(query, k, filter);
    const documents = result.map(
      ([{ pageContent, metadata }, score]): Document => ({
        pageContent,
        metadata,
        score,
      }),
    );

    return {
      statusCode: 200,
      body: {
        documents,
      },
    };
  } else {
    const documents = await vectorStore.similaritySearch(query, k, filter);

    return {
      statusCode: 200,
      body: {
        documents,
      },
    };
  }
});

export const embedDocuments = embedDocumentsHandler(...interceptors, async ({ input }) => {
  const { texts, modelRefKey } = input.body;

  const embeddingModel = findEmbeddingModelByRefKey(modelRefKey);
  if (!embeddingModel) {
    throw new Error(`InvalidPayload: no embedding model found for ref key ${modelRefKey}.`);
  }

  const embeddings = await getEmbeddingsByModelId(embeddingModel.modelId).embedDocuments(texts);

  return {
    statusCode: 200,
    body: {
      embeddings,
      model: embeddingModel.modelId,
    },
  };
});

export const embedQuery = embedQueryHandler(...interceptors, async ({ input }) => {
  const { text, modelRefKey } = input.body;

  if (text == null || text.length < 1) {
    throw new Error('InvalidPayload: text is required');
  }

  const embeddingModel = findEmbeddingModelByRefKey(modelRefKey);
  if (!embeddingModel) {
    throw new Error(`InvalidPayload: no embedding model found for ref key ${modelRefKey}.`);
  }

  const embedding = await getEmbeddingsByModelId(embeddingModel.modelId).embedQuery(text);

  return {
    statusCode: 200,
    body: {
      embedding,
      model: embeddingModel.modelId,
    },
  };
});

export const embeddingModelInventory = embeddingModelInventoryHandler(...interceptors, async () => {
  return {
    statusCode: 200,
    body: {
      models: ENV.EMBEDDINGS_SAGEMAKER_MODELS.map(
        (x) =>
          ({
            modelId: x.modelId,
            modelRefKey: x.modelRefKey,
            uuid: x.uuid,
            dimension: x.dimensions,
          } as EmbeddingModel),
      ),
    },
  };
});
