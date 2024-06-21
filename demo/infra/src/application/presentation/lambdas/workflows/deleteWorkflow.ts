/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { deleteWorkflow } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workflow';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { interceptors } from 'api-typescript-interceptors';
import { deleteWorkflowHandler, DeleteWorkflowResponseContent } from 'api-typescript-runtime';

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb);

export const handler = deleteWorkflowHandler(...interceptors, async ({ input, interceptorContext }) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) throw new Error(`expected env variable TABLE_NAME but none was found`);

  const userId = interceptorContext.callingIdentity?.identityId;
  if (!userId) throw new Error(`no userId was found in context`);

  const workflowId = input.requestParameters.workflowId;
  if (!workflowId) {
    throw new Error(`no workflow id in request parameters`);
  }

  await deleteWorkflow(documentClient, tableName, workflowId);

  const response: DeleteWorkflowResponseContent = {
    workflowId,
  };

  return {
    statusCode: 200,
    body: response,
  };
});
