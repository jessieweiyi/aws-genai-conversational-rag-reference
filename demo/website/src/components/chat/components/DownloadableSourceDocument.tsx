/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { SpaceBetween } from '@cloudscape-design/components';
import { FC, useMemo } from 'react';
import { NoPreviewAvailable } from './NoPreviewAvailable';
import { PdfSourceDocumentPreview } from './PdfSourceDocumentPreview';
import { TEXT_EXTENSION_SET, TextDocumentPreview } from './TextDocumentPreview';
import { DownloadableDocumentDetails } from './types';

export interface DownloadableSourceDocumentProps {
  readonly document: DownloadableDocumentDetails;
}

export const DownloadableSourceDocument: FC<DownloadableSourceDocumentProps> = ({ document }) => {
  const url = useMemo(() => new URL(document.downloadUrl), [document.downloadUrl]);
  const fileExt = useMemo(() => {
    const parts = url.pathname.split('.');
    return parts[parts.length - 1];
  }, [url]);

  return (
    <>
      <SpaceBetween size="l">
        {fileExt === 'pdf' ? (
          <PdfSourceDocumentPreview document={document} />
        ) : TEXT_EXTENSION_SET.has(fileExt) ? (
          <TextDocumentPreview downloadUrl={document.downloadUrl} fileExtension={fileExt} />
        ) : (
          <NoPreviewAvailable downloadUrl={document.downloadUrl} />
        )}
      </SpaceBetween>
    </>
  );
};
