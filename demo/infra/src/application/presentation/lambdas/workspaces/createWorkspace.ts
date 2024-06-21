/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { createWorkspace } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workspace';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { interceptors } from 'api-typescript-interceptors';
import { createWorkspaceHandler, CreateWorkspaceResponseContent, WorkspaceDefinition } from 'api-typescript-runtime';

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const handler = createWorkspaceHandler(...interceptors, async ({ input, interceptorContext }) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) throw new Error('expected env variable TABLE_NAME but none was found');

  const userId = interceptorContext.callingIdentity?.identityId;
  if (!userId) throw new Error('no userId was found in context');

  const { name, description, type, chatModel, data, routerDefinition } = input.body;

  if (!name || name.length === 0) throw new Error('name is invalid');

  const { workspace } = await createWorkspace(documentClient, tableName, userId, {
    name,
    description,
    type,
    data,
    routerDefinition,
    chatModel,
  });

  const response: CreateWorkspaceResponseContent = {
    ...workspace,
  };

  return {
    statusCode: 200,
    body: response,
  };
});
