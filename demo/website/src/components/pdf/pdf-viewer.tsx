/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */

import { Spinner } from '@cloudscape-design/components';

import React, { useCallback, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

export interface PdfViewerProps {
  readonly url: string;
  readonly pageNumber: number;
  readonly setNumPages: (numPages: number) => void;
}

/**
 * Component for displaying a pdf document
 */
export const PdfViewer: React.FC<PdfViewerProps> = ({ url, pageNumber, setNumPages }) => {
  // Reference to the canvas
  const canvas = useRef<HTMLCanvasElement>();

  // Set the number of pages when the document loads
  const onDocumentLoadSuccess = useCallback((pdf: any) => {
    setNumPages(pdf.numPages);
  }, []);

  const file = useMemo(() => url, [url]);

  return (
    <>
      <div style={{ width: '100%', height: '100%', backgroundColor: '#eee' }}>
        <div style={{ marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess} loading={<Spinner size="large" />}>
            <Page
              className="pdf-canvas"
              scale={1}
              canvasRef={canvas as any}
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </>
  );
};
