/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { deleteWorkspace } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workspace';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { interceptors } from 'api-typescript-interceptors';
import { deleteWorkspaceHandler, DeleteWorkspaceResponseContent } from 'api-typescript-runtime';

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb);

export const handler = deleteWorkspaceHandler(...interceptors, async ({ input, interceptorContext }) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) throw new Error(`expected env variable TABLE_NAME but none was found`);

  const userId = interceptorContext.callingIdentity?.identityId;
  if (!userId) throw new Error(`no userId was found in context`);

  const workspaceId = input.requestParameters.workspaceId;
  if (!workspaceId) {
    throw new Error(`no workspace id in request parameters`);
  }

  await deleteWorkspace(documentClient, tableName, workspaceId);

  const response: DeleteWorkspaceResponseContent = {
    workspaceId,
  };

  return {
    statusCode: 200,
    body: response,
  };
});
