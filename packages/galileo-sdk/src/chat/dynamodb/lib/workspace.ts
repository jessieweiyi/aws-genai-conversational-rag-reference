/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  ScanCommandInput,
  DeleteCommand,
  GetCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DDBWorkspace, DDBUpdateOutput, DDBGetOutput } from './types.js';
import { getAllByPagination } from './util.js';

export async function getWorkspace(documentClient: DynamoDBDocumentClient, tableName: string, workspaceId: string) {
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      workspaceId,
    },
  });

  const response = (await documentClient.send(command)) as DDBGetOutput<DDBWorkspace>;

  return response.Item;
}

export async function batchGetWorkspaces(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  workspaceIds: string[],
) {
  const command = new BatchGetCommand({
    RequestItems: {
      [tableName]: {
        Keys: workspaceIds.map((id) => ({
          workspaceId: id,
        })),
      },
    },
  });

  const response = await documentClient.send(command);

  const results = response.Responses?.[tableName] || {};

  return Object.values(results) as DDBWorkspace[];
}

export async function createWorkspace(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  data: Omit<DDBWorkspace, 'userId' | 'createdAt' | 'workspaceId' | 'dataImport'>,
) {
  const newWorkspaceId = uuidv4();

  const timestamp = Date.now();
  const workspace: DDBWorkspace = {
    ...data,
    workspaceId: newWorkspaceId,
    createdAt: timestamp,
    userId: userId,
    dataImport: {
      status: 'NOT_STARTED',
    },
  };

  const command = new PutCommand({
    TableName: tableName,
    Item: workspace,
    ReturnValues: 'NONE',
  });

  const response = await documentClient.send(command);

  return {
    response,
    workspace,
  };
}

export async function updateWorkspace(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  workspaceId: string,
  data: Pick<DDBWorkspace, 'type' | 'name' | 'description' | 'prompt' | 'chatModel' | 'routerDefinition'>,
) {
  let updateExpression =
    'set #workspaceName = :workspaceName, description = :description, prompt = :prompt, chatModel = :chatModel';

  let expressionAttributeValues: any = {
    ':workspaceName': data.name,
    ':description': data.description || '',
    ':prompt': data.prompt || {},
    ':chatModel': data.chatModel || {},
    ':workspaceType': data.type,
  };

  if (data.type === 'ROUTER') {
    updateExpression = `${updateExpression}, routerDefinition = :routerDefinition`;

    expressionAttributeValues = {
      ...expressionAttributeValues,
      ':routerDefinition': data.routerDefinition || {},
    };
  } // DATA (embeddingModel) should not be changed

  const command = new UpdateCommand({
    TableName: tableName,
    Key: {
      workspaceId,
    },
    ConditionExpression: 'attribute_exists(workspaceId) AND #workspaceType = :workspaceType',
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: {
      '#workspaceName': 'name',
      '#workspaceType': 'type',
    },
    ReturnValues: 'ALL_NEW',
  });

  const result = (await documentClient.send(command)) as DDBUpdateOutput<DDBWorkspace>;
  return result.Attributes;
}

export async function listWorkspace(documentClient: DynamoDBDocumentClient, tableName: string) {
  const commandInput: ScanCommandInput = {
    TableName: tableName,
  };

  return getAllByPagination<DDBWorkspace>(documentClient, commandInput, 'Scan');
}

export async function deleteWorkspace(documentClient: DynamoDBDocumentClient, tableName: string, workspaceId: string) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: {
      workspaceId,
    },
    ReturnValues: 'ALL_OLD',
  });

  return documentClient.send(command);
}
