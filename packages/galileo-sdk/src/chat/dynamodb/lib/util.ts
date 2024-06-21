/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import {
  BatchWriteCommand,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  DynamoDBDocumentClient,
  QueryCommandInput,
  ScanCommandInput,
  paginateQuery,
  paginateScan,
} from '@aws-sdk/lib-dynamodb';

import { AllKeys, Keys, GSI1Keys } from './types.js';

export function generateNextToken(params: AllKeys): string {
  return `${params.PK}|${params.SK}|${params.GSI1PK}|${params.GSI1SK}`;
}

export function parseNextToken(nextToken: string): AllKeys {
  const [PK, SK, GSI1PK, GSI1SK] = nextToken.split('|');
  return {
    PK,
    SK,
    GSI1PK,
    GSI1SK,
  };
}

export function getChatKey(userId: string, chatId: string = ''): Keys {
  return {
    PK: userId,
    SK: `CHAT#${chatId}`,
  };
}

export function getChatsByTimeKey(userId: string, timestamp?: string | number): GSI1Keys {
  return {
    GSI1PK: `${userId}#CHAT`,
    ...(timestamp ? { GSI1SK: timestamp } : {}),
  };
}

export function getChatMessageKey(userId: string, messageId: string = ''): Keys {
  return {
    PK: userId,
    SK: `MESSAGE#${messageId}`,
  };
}

export function getChatMessagesByTimeKey(userId: string, chatId: string, timestamp: string = ''): GSI1Keys {
  return {
    GSI1PK: `${userId}#CHAT#${chatId}`,
    GSI1SK: `${timestamp}`,
  };
}

export function getMessageSourceKey(userId: string, messageId: string, sourceKey: string = ''): Keys {
  return {
    PK: userId,
    SK: `SOURCE#${messageId}#${sourceKey}`,
  };
}

export async function bulkDelete(ddbClient: DynamoDBDocumentClient, tableName: string, keys: Keys[]): Promise<void> {
  type DeleteRequestItem = Pick<
    Required<NonNullable<BatchWriteCommandOutput['UnprocessedItems']>>[string][number],
    'DeleteRequest'
  >;

  let unprocessed: DeleteRequestItem[] = keys.map((i) => ({
    DeleteRequest: {
      Key: i,
    },
  }));

  while (unprocessed.length > 0) {
    // take the first 25 from the unprocessed items
    const nextItemsToDelete = unprocessed.splice(0, 25);
    const input: BatchWriteCommandInput = {
      RequestItems: {
        [tableName]: nextItemsToDelete,
      },
    };
    const command = new BatchWriteCommand(input);
    const result = await ddbClient.send(command);

    if (
      result.UnprocessedItems &&
      result.UnprocessedItems[tableName] &&
      Array.isArray(result.UnprocessedItems[tableName]) &&
      result.UnprocessedItems[tableName].length > 0
    ) {
      // put the unprocessed items back at the front
      unprocessed = [...result.UnprocessedItems[tableName], ...unprocessed];
    }
  }
}

export async function getAllByPagination<Entity>(
  client: DynamoDBDocumentClient,
  commandInput: QueryCommandInput | ScanCommandInput,
  commandType: 'Query' | 'Scan' = 'Query',
) {
  let entities: Entity[] = [];

  const paginationConfig = {
    client,
    pageSize: 100,
  };

  const paginate = commandType === 'Query' ? paginateQuery : paginateScan;

  const paginator = paginate(paginationConfig, commandInput);

  for await (const page of paginator) {
    if (page.Items !== undefined && Array.isArray(page.Items) && page.Items.length > 0) {
      entities = [...entities, ...(page.Items as Entity[])];
    }
  }

  return entities;
}
