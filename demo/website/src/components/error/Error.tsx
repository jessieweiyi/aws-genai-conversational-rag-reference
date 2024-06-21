/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

import { Alert } from '@cloudscape-design/components';
import { FC, ReactNode } from 'react';

export interface ErrorProps {
  readonly errors: any[];
  readonly header?: ReactNode;
}

export const Error: FC<ErrorProps> = ({ header, errors }) => {
  return (
    <>
      {errors.map((err, idx) => (
        <Alert key={`err-alert-${idx}`} type="error" header={header ?? err.status ?? 'Error'}>
          {err.message ?? JSON.stringify(err)}
        </Alert>
      ))}
    </>
  );
};
