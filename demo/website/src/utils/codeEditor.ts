/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { isEmpty } from 'lodash';

export function toCodeEditorJson(value: any, defaultValue: string = '{}'): string {
  if (value == null) return defaultValue;
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

export function fromCodeEditorJson<T = any>(value?: string, defaultValue?: T): T | undefined {
  if (value == null || isEmpty(value)) return defaultValue;
  return JSON.parse(value);
}
