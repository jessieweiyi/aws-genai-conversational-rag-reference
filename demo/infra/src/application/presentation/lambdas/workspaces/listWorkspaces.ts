/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { listWorkspace } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workspace';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { interceptors } from 'api-typescript-interceptors';
import { listWorkspacesHandler, ListWorkspacesResponseContent } from 'api-typescript-runtime';

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb);

export const handler = listWorkspacesHandler(...interceptors, async ({ interceptorContext }) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) throw new Error(`expected env variable TABLE_NAME but none was found`);

  const userId = interceptorContext.callingIdentity?.identityId;
  if (!userId) throw new Error(`no userId was found in context`);

  const items = await listWorkspace(documentClient, tableName);

  const response: ListWorkspacesResponseContent = {
    workspaces: items.map((x) => ({
      ...x,
    })),
  };

  return {
    statusCode: 200,
    body: response,
  };
});
