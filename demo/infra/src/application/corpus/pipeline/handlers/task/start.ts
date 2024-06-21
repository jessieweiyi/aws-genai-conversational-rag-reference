/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { getWorkspace } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workspace';
import { getPostgresTableNameByWorkspace } from '@aws/galileo-sdk/lib/vectorstores/pgvector/utils';
import { Logger, injectLambdaContext } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SFNClient, ListExecutionsCommand } from '@aws-sdk/client-sfn';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import middy from '@middy/core';
import errorLogger from '@middy/error-logger';
import inputOutputLogger from '@middy/input-output-logger';
import { State } from '../../types';

const logger = new Logger();

const client = new SFNClient({});
const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb);

async function lambdaHandler(state: State): Promise<State> {
  const stateMachineArn = state.StateMachine.Id;
  const executionArn = state.Execution.Id;

  const overrides: State = (state.Execution as any).Input || {};

  const environment = {
    ...state.Environment,
    ...overrides.Environment,
  };

  const workspaceTable = environment.WORKSPACE_TABLE;
  const workspaceId = environment.WORKSPACE_ID;

  if (!workspaceId) {
    throw new Error('WORKSPACE_ID is not provided');
  }

  const embeddingModelInfo = await getEmbeddingInfoByWorkspaceId(workspaceTable, workspaceId);

  if (!embeddingModelInfo) {
    throw new Error(`Unable to locate embedding model info for workspace ${workspaceId}`);
  }

  // Add additional environment variables required by the following tasks
  environment.EMBEDDING_TABLENAME = getPostgresTableNameByWorkspace(workspaceId);
  environment.EMBEDDING_MODEL_ID = embeddingModelInfo.modelId;
  environment.EMBEDDING_MODEL_VECTOR_SIZE = String(embeddingModelInfo.dimensions);

  // Remove this environment variable as SageMaker processing job doesn't support the JSON string
  delete environment.EMBEDDINGS_SAGEMAKER_MODELS;

  const { executions } = await client.send(
    new ListExecutionsCommand({
      stateMachineArn,
      statusFilter: 'RUNNING',
    }),
  );

  const commonFields = {
    ...state,
    ...overrides,
    Environment: environment,
  };

  if (executions == null) {
    return {
      ...commonFields,
      ExecutionStatus: {
        IsRunning: false,
      },
    };
  }

  for (const execution of executions) {
    if (executionArn != execution.executionArn) {
      return {
        ...commonFields,
        ExecutionStatus: {
          IsRunning: true,
        },
      };
    }
  }

  return {
    ...commonFields,
    ExecutionStatus: {
      IsRunning: false,
    },
  };
}

const getEmbeddingInfoByWorkspaceId = async (workspaceTable: string, workspaceId: string) => {
  const workspace = await getWorkspace(documentClient, workspaceTable, workspaceId);
  return workspace?.data?.indexing?.embeddingModel || null;
};

export const handler = middy<State, State, Error, any>(lambdaHandler)
  .use(injectLambdaContext(logger, { logEvent: true }))
  .use(inputOutputLogger())
  .use(
    errorLogger({
      logger(error) {
        logger.error('Task failed with error:', error as Error);
      },
    }),
  );

export default handler;
