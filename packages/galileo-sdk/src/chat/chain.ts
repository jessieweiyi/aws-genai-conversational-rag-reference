/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { ChainValues } from '@langchain/core/utils/types';
import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { BaseChain, ChainInputs, LLMChain, StuffDocumentsChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { ChatEngineCallbacks } from './callback.js';
import { StuffDocumentsMetadataChain } from './stuff-documents-metadata-chain.js';
import { ChatEngineWorkflow } from './workflow/types.js';
import { getLogger } from '../common/index.js';
import { PojoOutputParser } from '../langchain/output_parsers/pojo.js';

const logger = getLogger('chat/chain');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoadValues = Record<string, any>;

export interface ChatEngineChainInputOptions extends ChainInputs {
  returnSourceDocuments?: boolean;
  engineCallbacks?: ChatEngineCallbacks;
  useStreaming?: boolean;
  inputKey?: string;
}

export interface ChatEngineChainInput extends ChatEngineChainInputOptions {
  readonly workflow: ChatEngineWorkflow;
}

export class ChatEngineChain extends BaseChain implements ChatEngineChainInput {
  static lc_name() {
    return 'ChatEngineChain';
  }

  /**
   * Static method to create a new ChatEngineChain from a workflow
   * @returns A new instance of ChatEngineChain.
   */
  static fromWorkflow(workflow: ChatEngineWorkflow, options: ChatEngineChainInputOptions): ChatEngineChain {
    const { verbose, ...rest } = options;

    const instance = new this({
      verbose,
      workflow,
      ...rest,
    });
    return instance;
  }

  inputKey = 'question';
  chatHistoryKey = 'chat_history';

  get inputKeys() {
    return [this.inputKey, this.chatHistoryKey];
  }

  get outputKeys() {
    return this.returnSourceDocuments ? ['sourceDocuments'] : [];
  }

  get traceData(): any {
    return this._traceData;
  }

  workflow: ChatEngineWorkflow;

  returnSourceDocuments = false;

  engineCallbacks?: ChatEngineCallbacks | undefined;
  useStreaming?: boolean;
  protected _traceData?: any;

  constructor(fields: ChatEngineChainInput) {
    super(fields);
    this.workflow = fields.workflow;
    this.inputKey = fields.inputKey ?? this.inputKey;
    this.returnSourceDocuments = fields.returnSourceDocuments ?? this.returnSourceDocuments;
    this.engineCallbacks = fields.engineCallbacks;
    this.useStreaming = fields.useStreaming ?? false;
  }

  /** @ignore */
  async _call(values: ChainValues, _runManager?: CallbackManagerForChainRun): Promise<ChainValues> {
    if (!(this.inputKey in values)) {
      throw new Error(`Question key ${this.inputKey} not found.`);
    }
    if (!(this.chatHistoryKey in values)) {
      throw new Error(`Chat history key ${this.chatHistoryKey} not found.`);
    }
    const question: string = values[this.inputKey];
    const chatHistory = values[this.chatHistoryKey] || [];

    let steps = [...this.workflow.steps];
    let stepResult: ChainValues = values;
    let docs: Document[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      switch (step.type) {
        case 'REQUEST_RESPONSE': {
          const input = {
            ...stepResult,
            chat_history: stepResult.chat_history ?? [],
          };

          console.log('input', input, step.context); //JW: { question: 'Hello', chat_history: [] }

          // this.updateStatusCallback({
          //   operation: step.type,
          //   status: ChainLLMCallStatus.STARTING,
          //   payload: {
          //     message: `Calling classify chain with question "${stepResult.question}"`,
          //   },
          // });

          const res = await new LLMChain({
            llm: step.context.llm,
            prompt: step.context.prompt,
            outputKey: i === steps.length - 1 ? 'text' : 'question',
          }).call(input);
          stepResult = { ...stepResult, ...res };
          break;
        }
        case 'DATA_SEARCH': {
          // TO-DO(JW)
          // this.updateStatusCallback({
          //   operation: ChainOperation.DOCUMENT_RETRIEVE,
          //   status: ChainLLMCallStatus.STARTING,
          //   payload: {
          //     message: `Calling document retrieve step with question "${stepResult.question}"`,
          //   },
          // });

          docs = await step.retriever.getRelevantDocuments(stepResult.question);
          stepResult = { ...stepResult, input_documents: docs };
          // TODO: Consider truncating directly referenced document content as well as similarity search docs
          const input = { ...stepResult, input_documents: docs };

          const res = await new StuffDocumentsMetadataChain({
            llmChain: new LLMChain({ llm: step.context.llm, prompt: step.context.prompt }),
          }).call(input);
          stepResult = { ...stepResult, ...res, ...(res.text ? { question: res.text } : {}) };
          break;
        }
        case 'ROUTER': {
          const res = await new LLMChain({
            llm: step.context.llm,
            prompt: step.context.prompt,
            outputKey: 'routes',
            outputParser: new PojoOutputParser<any>(),
          }).call(stepResult);
          const routeKeyValue = res.routes?.[step.responseRouteKey];
          if (!routeKeyValue) {
            throw new Error(
              `Routing error! Response was not of the required output format { "${step.responseRouteKey}": "<routeKey>" }`,
            );
          }

          if (!step.routes[routeKeyValue]) {
            throw new Error(
              `No route found matching "${routeKeyValue}". Valid routes were: ${Object.keys(step.routes).join(', ')}`,
            );
          }

          // The routed-to step becomes the next step
          steps = [...steps.slice(0, i + 1), step.routes[routeKeyValue], ...steps.slice(i + 1)];

          // Ensure question is preserved from previous step
          stepResult = { ...stepResult, ...res, question: stepResult.question };
          break;
        }
      }
    }

    // TO-DO(JW): streamCallback/upStatusCallback
    // let classification: ChainValues | undefined;
    // if (this.classifyChain) {
    //   logger.debug('Calling classify chain: ', { question });
    //   const $$ClassifyChainExecutionTime = startPerfMetric('Chain.CLASSIFY.ExecutionTime', {
    //     highResolution: true,
    //   });
    //   this.updateStatusCallback({
    //     operation: ChainOperation.CLASSIFY,
    //     status: ChainLLMCallStatus.STARTING,
    //     payload: {
    //       message: `Calling classify chain with question "${question}"`,
    //     },
    //   });
    //   classification = (await this.classifyChain.call({ question }))[this.classificationKey];
    //   const chainExecTime = $$ClassifyChainExecutionTime();

    //   this.updateStatusCallback({
    //     operation: ChainOperation.CLASSIFY,
    //     status: ChainLLMCallStatus.SUCCESS,
    //     payload: {
    //       message: `Classify chain execution finished`,
    //       executionTime: chainExecTime,
    //     },
    //   });
    //   logger.debug('Result from classify chain: ', { classification, chainExecTime });
    // }

    // let newQuestion = classification?.question || question;
    // const hasHistory = chatHistory.length > 0;
    // if (hasHistory) {
    //   const condenseQuestionInput: ChainValues = {
    //     question: newQuestion,
    //     ...classification,
    //     chat_history: chatHistory,
    //   };
    //   logger.debug('Chain:condenseQuestionChain:input', { input: condenseQuestionInput });
    //   const $$QuestionGeneratorExecutionTime = startPerfMetric('Chain.CONDENSE_QUESTION.ExecutionTime', {
    //     highResolution: true,
    //   });
    //   this.updateStatusCallback({
    //     operation: ChainOperation.CONDENSE_QUESTION,
    //     status: ChainLLMCallStatus.STARTING,
    //     payload: {
    //       message: `Calling condense question chain with ${chatHistory.length} history items`,
    //     },
    //   });
    //   const result = await this.condenseQuestionChain.call(
    //     condenseQuestionInput,
    //     runManager?.getChild('question_generator'),
    //   );
    //   const questionGeneratorExecTime = $$QuestionGeneratorExecutionTime();
    //   this.updateStatusCallback({
    //     operation: ChainOperation.CONDENSE_QUESTION,
    //     status: ChainLLMCallStatus.SUCCESS,
    //     payload: {
    //       message: `Condense question chain execution finished`,
    //       executionTime: questionGeneratorExecTime,
    //     },
    //   });
    //   logger.debug('Chain:condenseQuestionChain:output', { output: result, questionGeneratorExecTime });

    //   const keys = Object.keys(result);
    //   if (keys.length === 1) {
    //     newQuestion = result[keys[0]];
    //     logger.debug(`Rewrote question from "${question}" to "${newQuestion}`);
    //   } else {
    //     throw new Error('Return from llm chain has multiple values, only single values supported.');
    //   }
    // }

    // logger.debug('Chain:retriever:getRelevantDocuments:query', { query: newQuestion });
    // const $$GetRelevantDocumentsExecutionTime = startPerfMetric('Chain.DocumentRetrieval.ExecutionTime', {
    //   highResolution: true,
    // });
    // this.updateStatusCallback({
    //   operation: ChainOperation.DOCUMENT_RETRIEVE,
    //   status: ChainLLMCallStatus.STARTING,
    //   payload: {
    //     message: `Calling document retrieve step with question "${newQuestion}"`,
    //   },
    // });
    // const docs = await this.retriever.getRelevantDocuments(newQuestion, runManager?.getChild('retriever'));
    // const docRetrievalExecTime = $$GetRelevantDocumentsExecutionTime();
    // this.updateStatusCallback({
    //   operation: ChainOperation.DOCUMENT_RETRIEVE,
    //   status: ChainLLMCallStatus.SUCCESS,
    //   payload: {
    //     message: `Document retrieval finished`,
    //     executionTime: docRetrievalExecTime,
    //   },
    // });

    // const inputs = {
    //   ...classification,
    //   input_documents: docs,
    //   chat_history: chatHistory,
    //   question: newQuestion,
    // };

    // logger.debug('Chain:qaChain:input', { input: inputs });
    // const $$CombineDocumentsExecutionTime = startPerfMetric('Chain.QA.ExecutionTime', {
    //   highResolution: true,
    // });

    // this.updateStatusCallback({
    //   operation: ChainOperation.QA,
    //   status: ChainLLMCallStatus.STARTING,
    //   payload: {
    //     message: `Calling QA chain with ${inputs.input_documents.length} documents`,
    //   },
    // });

    // let streamedResult: string = '';
    // let result;
    // if (this.useStreaming) {
    //   const combineDocsRunManager = runManager?.getChild('combine_documents');
    //   logger.debug('Chain:qaChain:streaming', { useStreaming: this.useStreaming, combineDocsRunManager });

    //   // * this may need to be replaced depending on the actual model used to enable streaming
    //   //   * seems that generic approach will result in only one chunk (the whole response) instead of incremental response
    //   //   * this is with langchain@0.0.194 -- there were huge changes since so this issue may be solved - needs to be tested
    //   //   * you'll need to look into how you instantiate `this.qaChain`
    //   const stream = await this.qaChain.stream(inputs, combineDocsRunManager);

    //   let chunkIndex = 1;

    //   for await (const chunk of stream) {
    //     logger.debug(`Received streaming chunk ${chunkIndex++}`);
    //     streamedResult += chunk.text;
    //     this.streamCallback(chunk.text);
    //   }

    //   result = { text: streamedResult };
    // } else {
    //   result = await this.qaChain.invoke(inputs, runManager?.getChild('combine_documents'));
    // }

    // const qaChainExecTime = $$CombineDocumentsExecutionTime();
    // this.updateStatusCallback({
    //   operation: ChainOperation.QA,
    //   status: ChainLLMCallStatus.SUCCESS,
    //   payload: {
    //     message: `QA chain execution finished`,
    //     executionTime: qaChainExecTime,
    //   },
    // });
    // logger.debug('Chain:qaChain:output', { output: result });

    this._traceData = {
      originalQuestion: question,
      chainValues: values,
      chatHistory,
      sourceDocuments: docs,
      result: stepResult,
    };

    logger.debug('Trace data', { traceData: this.traceData });

    if (this.returnSourceDocuments) {
      return {
        ...stepResult,
        sourceDocuments: docs,
      };
    }

    return stepResult;
  }

  _chainType(): string {
    return 'conversational_retrieval_chain';
  }

  // private updateStatusCallback(options: UpdateStatusCallbackOptions): void {
  //   if (this.engineCallbacks != null) {
  //     this.engineCallbacks.updateStatus(options);
  //   }
  // }

  // private streamCallback(newChunk: string): void {
  //   if (this.engineCallbacks != null) {
  //     this.engineCallbacks.streamChunks([newChunk]);
  //   }
  // }
}

export class CustomStuffDocumentsChain extends StuffDocumentsChain {
  documentsVariableName = this.documentVariableName + '_documents';

  _prepInputs(values: ChainValues): ChainValues {
    return {
      // propagate the "input_documents" objects array to prompt for handlebars to control rendering
      [this.documentsVariableName]: values[this.inputKey],
      ...super._prepInputs(values),
    };
  }
}
