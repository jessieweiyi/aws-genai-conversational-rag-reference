/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { CodeEditorProps, Spinner } from '@cloudscape-design/components';
import { useQuery } from '@tanstack/react-query';
import { DefaultApiDefaultContext } from 'api-typescript-react-query-hooks';
import { FC } from 'react';
import { NoPreviewAvailable } from './NoPreviewAvailable';
import { CodeEditor } from '../../code-editor';

export interface TextDocumentPreviewProps {
  readonly fileExtension: string;
  readonly downloadUrl: string;
}

const useTextContent = (downloadUrl: string) => {
  return useQuery(
    ['download', downloadUrl],
    async () => {
      const res = await fetch(downloadUrl);
      const buffer = await res.arrayBuffer();
      return new TextDecoder().decode(buffer);
    },
    {
      context: DefaultApiDefaultContext as any,
    },
  );
};

export const TEXT_EXTENSIONS = ['txt', 'sql', 'json', 'js', 'py', 'ts'] as const;
export const TEXT_EXTENSION_SET = new Set<string>(TEXT_EXTENSIONS);

const EXTENSION_TO_LANGUAGE: Partial<Record<(typeof TEXT_EXTENSIONS)[number], CodeEditorProps.Language>> = {
  sql: 'sql',
  txt: 'text',
  json: 'json',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
};

export const TextDocumentPreview: FC<TextDocumentPreviewProps> = ({ downloadUrl, fileExtension }) => {
  const textContent = useTextContent(downloadUrl);

  return !textContent.isLoading && textContent.data !== undefined ? (
    <CodeEditor
      value={textContent.data}
      readonly
      language={EXTENSION_TO_LANGUAGE[fileExtension as keyof typeof EXTENSION_TO_LANGUAGE] ?? 'text'}
      editorContentHeight={400}
    />
  ) : textContent.error ? (
    <NoPreviewAvailable downloadUrl={downloadUrl} />
  ) : (
    <Spinner size="large" />
  );
};
