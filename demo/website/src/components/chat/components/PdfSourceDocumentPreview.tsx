/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Box, Button, Pagination } from '@cloudscape-design/components';
import { FC, useState } from 'react';
import { DownloadableDocumentDetails } from './types';
import { PdfViewer } from '../../pdf/pdf-viewer';

export interface PdfSourceDocumentPreviewProps {
  readonly document: DownloadableDocumentDetails;
}

export const PdfSourceDocumentPreview: FC<PdfSourceDocumentPreviewProps> = ({ document }) => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(document.metadata?.loc?.pageNumber ?? 1);

  return (
    <Box>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pagination
          currentPageIndex={page}
          pagesCount={numPages}
          onChange={(e) => setPage(e.detail.currentPageIndex)}
        />
        <Button download variant="primary" iconName="download" href={document.downloadUrl}>
          Download
        </Button>
      </div>
      <PdfViewer url={document.downloadUrl} pageNumber={page} setNumPages={setNumPages} />
    </Box>
  );
};
