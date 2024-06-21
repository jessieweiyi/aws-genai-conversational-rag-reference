/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { updateWorkspace } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workspace';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { interceptors } from 'api-typescript-interceptors';
import { UpdateWorkspaceResponseContent, updateWorkspaceHandler } from 'api-typescript-runtime';

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const handler = updateWorkspaceHandler(...interceptors, async ({ input, interceptorContext }) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) throw new Error(`expected env variable TABLE_NAME but none was found`);

  const userId = interceptorContext.callingIdentity?.identityId;
  if (!userId) throw new Error(`no userId was found in context`);

  const workspaceId = input.requestParameters.workspaceId;
  if (!workspaceId || workspaceId.length === 0) throw new Error(`workspaceId is invalid`);

  const { name, ...rest } = input.body;
  if (!name || name.length === 0) throw new Error(`name is invalid`);

  const result = await updateWorkspace(documentClient, tableName, workspaceId, {
    name,
    ...rest,
  });

  if (!result) {
    return {
      statusCode: 500,
      body: {
        errorMessage: 'Returned entity empty',
      },
    };
  }

  const response: UpdateWorkspaceResponseContent = {
    ...result,
  };

  return {
    statusCode: 200,
    body: response,
  };
});
