/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Aurora, VectorStorage } from 'api-typescript-react-query-hooks';

export class VectorStorageUtils {
  public static isAurora = (vectorStorage: VectorStorage): vectorStorage is Aurora =>
    'aurora' in vectorStorage && !!vectorStorage.aurora;
}
