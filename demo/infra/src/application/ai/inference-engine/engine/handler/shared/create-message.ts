/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { createSignedFetcher } from '@aws/galileo-sdk/lib/auth/aws-sigv4';
import { ChatEngine } from '@aws/galileo-sdk/lib/chat';
import { ChatEngineCallbacks } from '@aws/galileo-sdk/lib/chat/callback';
import { getChat } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/chat';
import { createMetrics, startPerfMetric } from '@aws/galileo-sdk/lib/common/metrics';
import { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CreateChatMessageResponseContent, ServerTemporaryErrorResponseContent } from 'api-typescript-runtime';
import { cloneDeepWith, isUndefined, omitBy } from 'lodash';
import { ENV } from './env';
import { ChatEngineConfig } from './types';
import WorkflowBuilder from './workflow';
import applicationChatEngineConfigJson from '../chat-engine-config.json'; // HACK: temporary way to support updating app level config at deploy time

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb);

interface CreateMessageParams {
  readonly logger: Logger;

  // calling identity related data
  readonly userId: string;
  readonly idToken?: string;
  readonly isAdmin: boolean;

  // chat data
  readonly chatId: string;
  readonly question: string;

  // chat config
  readonly userConfigParam?: ChatEngineConfig;

  readonly engineCallbacks?: ChatEngineCallbacks;
  readonly useStreaming: boolean;
}

export const createMessage = async (
  params: CreateMessageParams,
): Promise<CreateChatMessageResponseContent | ServerTemporaryErrorResponseContent> => {
  const {
    logger,

    userId,
    idToken,
    isAdmin,

    chatId,
    question,

    engineCallbacks,
    useStreaming,
  } = params;
  const [metrics, logMetrics] = createMetrics({
    serviceName: 'InferenceEngine',
  });
  metrics.addDimension('component', 'inferenceEngine');

  const chatMessageTableName = process.env.CHAT_MESSAGE_TABLE_NAME;
  if (!chatMessageTableName) throw new Error(`expected env variable CHAT_MESSAGE_TABLE_NAME but none was found`);

  const workspaceTableName = process.env.WORKSPACE_TABLE_NAME;
  if (!workspaceTableName) throw new Error(`expected env variable WORKSPACE_TABLE_NAME but none was found`);

  const workflowTableName = process.env.WORKFLOW_TABLE_NAME;
  if (!workflowTableName) throw new Error(`expected env variable WORKFLOW_TABLE_NAME but none was found`);

  try {
    const $$PreQuery = startPerfMetric('PreQuery');
    metrics.addMetadata('chatId', chatId);

    const verbose = logger.getLevelName() === 'DEBUG';

    const chatDetails = await getChat(documentClient, chatMessageTableName, userId, chatId);

    if (!chatDetails) {
      return {
        errorMessage: `No chat found with id ${chatId} for user ${userId}`,
      };
    }

    const workflowBuilder = new WorkflowBuilder({
      documentClient,
      workflowTableName,
      workspaceTableName,
      userId,
      workflowId: chatDetails.workflowId,
      workflowType: chatDetails.workflowType,
    });

    const workflow = await workflowBuilder.build();

    logger.debug(`Located workflow details ${JSON.stringify(workflow)}`);

    // User request time config
    // [WARNING] User ChatEngineConfig from TypeSafeAPI automatically adds "undefined" for all
    // optional keys that are missing, this breaks spread over defaults.
    const userConfig = compactClone(/*input.body.options || */ {}); // TODO: consider config

    // Should we store this as "system" config once we implement config store?
    const systemConfig: ChatEngineConfig = applicationChatEngineConfigJson;

    const configs: ChatEngineConfig[] = [systemConfig, userConfig];

    const config = {
      ...systemConfig,
      ...userConfig,
    };

    logger.debug({ message: 'Resolved ChatEngineConfig', config, configs });

    const searchUrl = ENV.SEARCH_URL;
    const searchFetcher = createSignedFetcher({
      service: searchUrl.includes('lambda-url') ? 'lambda' : 'execute-api',
      credentials: fromNodeProviderChain(),
      region: process.env.AWS_REGION! || process.env.AWS_DEFAULT_REGION!,
      idToken,
    });

    const engine = await ChatEngine.from({
      search: {
        ...config.search,
        baseUrl: searchUrl,
        fetch: searchFetcher,
      },
      userId,
      chatId,
      chatHistoryTable: ENV.CHAT_MESSAGE_TABLE_NAME,
      chatHistoryTableIndexName: ENV.CHAT_MESSAGE_TABLE_GSI_INDEX_NAME,
      verbose,
      returnTraceData: isAdmin,
      workflow,

      engineCallbacks,
      useStreaming,
    });
    $$PreQuery();

    try {
      const $$QueryExecutionTime = startPerfMetric('QueryExecutionTime');
      const result = await engine.query(question);
      $$QueryExecutionTime();
      logger.info('Chain successfully executed query');
      logger.debug({ message: 'ChatEngine query result', result });
      const traceData = isAdmin
        ? {
            ...result.traceData,
            config,
            configs,
          }
        : undefined;
      return {
        question: {
          ...result.turn.human,
          text: result.question,
        },
        answer: {
          ...result.turn.ai,
          text: result.answer,
        },
        sources: result.turn.sources,
        traceData,
      };
    } catch (error) {
      logger.error('Failed to execute query', error as Error);

      return {
        errorMessage: String(error),
      };
    }
  } finally {
    logMetrics();
  }
};

/**
 * Deep clone that removes all undefined properties from objects.
 * @param value
 * @returns
 */
function compactClone<T extends object>(value: T): T {
  value = omitBy(value, isUndefined) as T;
  return cloneDeepWith(value, (_value) => {
    if (value === _value) return;
    if (typeof _value === 'object') {
      return compactClone(_value);
    }
  });
}
