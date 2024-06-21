/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { StuffDocumentsChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { ChainValues } from 'langchain/schema';

export class StuffDocumentsMetadataChain extends StuffDocumentsChain {
  public static renderDocument = (document: Document, index?: number): string => {
    return `${StuffDocumentsMetadataChain.renderDocumentMetadata(
      document,
      index,
    )}, ${StuffDocumentsMetadataChain.renderDocumentContent(document, index)}`;
  };

  public static renderDocuments = (documents: Document[]): string => {
    return documents.map((d, i) => StuffDocumentsMetadataChain.renderDocument(d, i)).join('\n\n');
  };

  public static renderDocumentContent = ({ pageContent, metadata }: Document, index?: number): string => {
    const docName =
      StuffDocumentsMetadataChain.getDocumentName(metadata?.source_location) ??
      `Document ${index !== undefined ? index + 1 : ''}`;
    return `${docName} Content: """\n${pageContent}\n"""`;
  };

  public static renderDocumentMetadata = ({ metadata }: Document, index?: number): string => {
    const docName =
      StuffDocumentsMetadataChain.getDocumentName(metadata?.source_location) ??
      `Document ${index !== undefined ? index + 1 : ''}`;
    return `${docName} Metadata: ${JSON.stringify(metadata)}`;
  };

  private static getDocumentName = (sourceLocation?: string) => {
    if (!sourceLocation) {
      return undefined;
    }
    const parts = sourceLocation.split('/');
    return parts[parts.length - 1];
  };

  _prepInputs(values: ChainValues): ChainValues {
    if (!(this.inputKey in values)) {
      throw new Error(`Document key ${this.inputKey} not found.`);
    }
    const { [this.inputKey]: docs, ...rest } = values;

    return {
      ...rest,
      [this.documentVariableName]: StuffDocumentsMetadataChain.renderDocuments(docs),
    };
  }
}
