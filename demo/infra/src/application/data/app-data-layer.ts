/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { isDevStage, stageAwareRemovalPolicy } from '@aws/galileo-cdk/lib/common';
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export interface AppDataLayerProps {}

export class AppDataLayer extends Construct {
  readonly datastore: ITable;
  readonly workspaceDataStore: ITable;
  readonly workflowDataStore: ITable;

  readonly gsiIndexName = 'GSI1';

  readonly wsConnections: ITable;

  constructor(scope: Construct, id: string, _props?: AppDataLayerProps) {
    super(scope, id);

    const dev = isDevStage(this);

    // Create the datastore for the CRUD operations
    const datastore = new Table(this, 'Datastore', {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: stageAwareRemovalPolicy(this),
      pointInTimeRecovery: !dev,
    });

    datastore.addGlobalSecondaryIndex({
      indexName: this.gsiIndexName,
      partitionKey: {
        name: 'GSI1PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: AttributeType.STRING,
      },
    });

    this.workspaceDataStore = new Table(this, 'WorkspaceDatastore', {
      partitionKey: {
        name: 'workspaceId',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: stageAwareRemovalPolicy(this),
      pointInTimeRecovery: !dev,
    });

    this.workflowDataStore = new Table(this, 'WorkflowDatastore', {
      partitionKey: {
        name: 'workflowId',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: stageAwareRemovalPolicy(this),
      pointInTimeRecovery: !dev,
    });

    this.datastore = datastore;

    this.wsConnections = new Table(this, 'WsConnection', {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: stageAwareRemovalPolicy(this),
      pointInTimeRecovery: !dev,
    });
  }
}
