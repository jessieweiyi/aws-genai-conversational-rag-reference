/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { getWorkflow } from '@aws/galileo-sdk/lib/chat/dynamodb/lib/workflow';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { interceptors } from 'api-typescript-interceptors';
import {
  getWorkflowHandler,
  GetWorkflowResponseContent,
  GetWorkflow404OperationResponse,
} from 'api-typescript-runtime';

const dynamodb = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(dynamodb);

export const handler = getWorkflowHandler(...interceptors, async ({ input, interceptorContext }) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) throw new Error(`expected env variable TABLE_NAME but none was found`);

  const userId = interceptorContext.callingIdentity?.identityId;
  if (!userId) throw new Error(`no userId was found in context`);

  const workflowId = input.requestParameters.workflowId;
  if (!workflowId) {
    throw new Error(`no workflow id in request parameters`);
  }

  const result = await getWorkflow(documentClient, tableName, workflowId);

  if (!result) {
    const notFoundResult: GetWorkflow404OperationResponse = {
      statusCode: 404,
      body: {
        errorMessage: `Workflow ${workflowId} not found`,
      },
    };
    return notFoundResult;
  }

  const response: GetWorkflowResponseContent = {
    ...result,
  };

  return {
    statusCode: 200,
    body: response,
  };
});
