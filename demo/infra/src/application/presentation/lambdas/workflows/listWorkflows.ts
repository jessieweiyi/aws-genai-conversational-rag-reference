/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { listWorkflows } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workflow';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { interceptors } from 'api-typescript-interceptors';
import { listWorkflowsHandler, ListWorkflowsResponseContent } from 'api-typescript-runtime';

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb);

export const handler = listWorkflowsHandler(...interceptors, async ({ interceptorContext }) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) throw new Error(`expected env variable TABLE_NAME but none was found`);

  const userId = interceptorContext.callingIdentity?.identityId;
  if (!userId) throw new Error(`no userId was found in context`);

  const items = await listWorkflows(documentClient, tableName);

  const response: ListWorkflowsResponseContent = {
    workflows: items,
  };

  return {
    statusCode: 200,
    body: response,
  };
});
