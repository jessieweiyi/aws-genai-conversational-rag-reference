/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import '../langchain/patch.js';
import { ChatEngineCallbacks } from './callback.js';
import { ChatEngineChain } from './chain.js';
import { DynamoDBChatMessageHistory } from './dynamodb/message-history.js';
import { ChatEngineHistory, ChatTurn } from './memory.js';
import { SearchRetrieverInput } from './search.js';
import { ChatEngineWorkflowHelper } from './workflow/helper.js';
import { WorkflowConfiguration, ChatEngineWorkflow } from './workflow/types.js';
import { startPerfMetric as $$$ } from '../common/metrics/index.js';
import { Dict } from '../models/index.js';

export interface ChatEngineFromOption {
  readonly chatId: string;
  readonly userId: string;
  readonly maxNewTokens?: number;
  readonly chatHistoryTable: string;
  readonly chatHistoryTableIndexName: string;
  readonly search: SearchRetrieverInput;
  readonly verbose?: boolean;
  readonly returnTraceData?: boolean;
  readonly engineCallbacks?: ChatEngineCallbacks;
  readonly workflow: WorkflowConfiguration;
  readonly useStreaming?: boolean;
}

interface ChatEngineProps {
  readonly chatId: string;
  readonly userId: string;
  readonly workflow: ChatEngineWorkflow;
  readonly chatHistory: DynamoDBChatMessageHistory;
  readonly memory: ChatEngineHistory;
  readonly verbose?: boolean;
  readonly returnTraceData?: boolean;
  readonly engineCallbacks?: ChatEngineCallbacks;
  readonly useStreaming?: boolean;
}

export class ChatEngine {
  static async from(options: ChatEngineFromOption): Promise<ChatEngine> {
    const {
      chatId,
      userId,
      workflow: workflowDefinition,
      maxNewTokens = 500,
      chatHistoryTable,
      chatHistoryTableIndexName,
      search: searchOptions,
      verbose = process.env.LOG_LEVEL === 'DEBUG',
    } = options;

    const workflow: ChatEngineWorkflow = {
      steps: await Promise.all(
        workflowDefinition.steps.map((step) =>
          ChatEngineWorkflowHelper.buildFromStep({
            step,
            searchOptions,
            maxNewTokens,
            verbose,
          }),
        ),
      ),
    };

    //TO-DO(JW) config
    //const historyLimit = config.memory?.limit ?? 20;
    const historyLimit = 20;
    const chatHistory = new DynamoDBChatMessageHistory({
      tableName: chatHistoryTable,
      indexName: chatHistoryTableIndexName,
      userId,
      chatId,
      messagesLimit: historyLimit,
    });

    const memory = new ChatEngineHistory({
      chatHistory,
      k: historyLimit,
    });

    return new ChatEngine({
      ...options,
      chatHistory,
      memory,
      workflow,
    });
  }

  readonly chatId: string;
  readonly userId: string;
  readonly chatHistory: DynamoDBChatMessageHistory;
  readonly memory: ChatEngineHistory;

  readonly chain: ChatEngineChain;
  readonly workflow: ChatEngineWorkflow;

  readonly engineCallbacks?: ChatEngineCallbacks;
  readonly useStreaming: boolean;

  protected readonly returnTraceData: boolean;

  constructor(props: ChatEngineProps) {
    const { chatId, userId, chatHistory, memory, verbose, returnTraceData, engineCallbacks, useStreaming, workflow } =
      props;

    this.workflow = workflow;
    this.returnTraceData = returnTraceData ?? false;

    this.chatId = chatId;
    this.userId = userId;

    this.chatHistory = chatHistory;
    this.memory = memory;

    this.engineCallbacks = engineCallbacks;
    this.useStreaming = useStreaming ?? false;

    this.chain = ChatEngineChain.fromWorkflow(this.workflow, {
      verbose,
      memory,
      returnSourceDocuments: true,
      engineCallbacks,
      useStreaming: this.useStreaming,
    }) as ChatEngineChain;

    if (!(this.chain instanceof ChatEngineChain)) {
      throw new Error('Chain is not instanceof ChatEngineChain');
    }
  }

  async query(query: string): Promise<ChatEngineQueryResponse> {
    const $time = $$$('Engine.Query.ExecutionTime', { highResolution: true });
    const result = await this.chain.invoke({ question: query });
    $time();
    const turn = this.memory.lastTurn;

    return {
      question: query,
      answer: result.text,
      turn,
      traceData: this.returnTraceData ? this._resolveTraceData() : undefined,
    };
  }

  protected _resolveTraceData(): Dict {
    try {
      return {
        chatId: this.chatId,
        userId: this.userId,
        ...this.chain.traceData,
      };
    } catch (error) {
      return {
        __resolveTraceError: (error as Error).message,
      };
    }
  }
}

export interface ChatEngineQueryResponse {
  /** The input question text for the query */
  readonly question: string;
  /** The output answer text from the engine */
  readonly answer: string;
  /** Full details regarding stored entities/sources for the turn (human => ai) */
  readonly turn: ChatTurn;
  /** Additional data about the query execution, such as debugging data for admins */
  readonly traceData?: Record<string, any>;
}
