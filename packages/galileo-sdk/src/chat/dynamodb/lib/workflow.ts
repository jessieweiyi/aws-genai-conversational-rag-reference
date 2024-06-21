/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  ScanCommandInput,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DDBWorkflow, DDBUpdateOutput, DDBGetOutput } from './types.js';
import { getAllByPagination } from './util.js';

export async function getWorkflow(documentClient: DynamoDBDocumentClient, tableName: string, workflowId: string) {
  const command = new GetCommand({
    TableName: tableName,
    Key: {
      workflowId,
    },
  });

  const response = (await documentClient.send(command)) as DDBGetOutput<DDBWorkflow>;

  return response.Item;
}

export async function createWorkflow(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  userId: string,
  data: Omit<DDBWorkflow, 'workflowId' | 'createdAt' | 'userId'>,
) {
  const newWorkflowId = uuidv4();

  const timestamp = Date.now();
  const workflow: DDBWorkflow = {
    ...data,
    workflowId: newWorkflowId,
    createdAt: timestamp,
    userId: userId,
  };

  const command = new PutCommand({
    TableName: tableName,
    Item: workflow,
    ReturnValues: 'NONE',
  });

  const response = await documentClient.send(command);

  return {
    response,
    workflow,
  };
}

export async function updateWorkflow(
  documentClient: DynamoDBDocumentClient,
  tableName: string,
  workflowId: string,
  data: Pick<DDBWorkflow, 'name' | 'description' | 'definition'>,
) {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: {
      workflowId,
    },
    ConditionExpression: 'attribute_exists(workflowId)',
    UpdateExpression:
      'set #workflowName = :workflowName, description = :description, #workflowDefinition = :workflowDefinition',
    ExpressionAttributeValues: {
      ':workflowName': data.name,
      ':description': data.description || '',
      ':workflowDefinition': data.definition || {},
    },
    ExpressionAttributeNames: {
      '#workflowDefinition': 'definition',
      '#workflowName': 'name',
    },
    ReturnValues: 'ALL_NEW',
  });

  const result = (await documentClient.send(command)) as DDBUpdateOutput<DDBWorkflow>;
  return result.Attributes;
}

export async function listWorkflows(documentClient: DynamoDBDocumentClient, tableName: string) {
  const commandInput: ScanCommandInput = {
    TableName: tableName,
  };

  return getAllByPagination<DDBWorkflow>(documentClient, commandInput, 'Scan');
}

export async function deleteWorkflow(documentClient: DynamoDBDocumentClient, tableName: string, workflowId: string) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: {
      workflowId,
    },
    ReturnValues: 'ALL_OLD',
  });

  return documentClient.send(command);
}
