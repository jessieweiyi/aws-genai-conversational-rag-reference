/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Alert, ExpandableSection, Header, Modal, TextContent } from '@cloudscape-design/components';
import { FC } from 'react';
import { DownloadableSourceDocument } from './DownloadableSourceDocument';
import { CodeEditor } from '../../code-editor';

export interface DocumentDetails {
  readonly metadata?: Record<string, any>;
  readonly downloadUrl?: string;
  readonly pageContent?: string;
}

export interface DocumentModalProps {
  readonly title: string;
  readonly document: DocumentDetails;
  readonly visible: boolean;
  readonly onDismiss: () => void;
}

export const DocumentModal: FC<DocumentModalProps> = ({ title, document, visible, onDismiss }) => {
  return (
    <Modal
      size="large"
      header={<Header variant="h3">{title}</Header>}
      onDismiss={onDismiss}
      footer={
        <ExpandableSection headerText="Metadata" variant="footer">
          <CodeEditor
            value={JSON.stringify(document.metadata ?? {}, null, 2)}
            language="json"
            readonly
            editorContentHeight={300}
          />
        </ExpandableSection>
      }
      visible={visible}
    >
      {document.downloadUrl ? (
        <DownloadableSourceDocument document={{ metadata: document.metadata, downloadUrl: document.downloadUrl! }} />
      ) : document.pageContent ? (
        <TextContent>
          <div style={{ whiteSpace: 'pre-wrap' }}>{document.pageContent}</div>
        </TextContent>
      ) : (
        <Alert type="info">This document cannot be previewed.</Alert>
      )}
    </Modal>
  );
};
