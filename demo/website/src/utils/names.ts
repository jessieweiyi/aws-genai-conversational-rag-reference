/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { ChatModel, VectorStorage } from 'api-typescript-react-query-hooks';
import kebabCase from 'lodash/kebabCase';
import { VectorStorageUtils } from './vectorStorage';

export const unionName = (union: object) => kebabCase(Object.keys(union).find((x) => x));

export const chatModelName = (model: ChatModel) => {
  return model.name;
};

export const vectorStorageName = (store: VectorStorage) => {
  if (VectorStorageUtils.isAurora(store)) {
    return 'Aurora PostgreSQL + pgvector';
  }
  return unionName(store);
};
