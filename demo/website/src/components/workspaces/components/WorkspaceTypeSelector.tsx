/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Cards } from '@cloudscape-design/components';
import { WorkspaceType } from 'api-typescript-react-query-hooks';
import { FC } from 'react';

export interface WorkspaceTypeSelectorProps {
  readonly selectedType?: WorkspaceType;
  readonly setSelectedType: (selectedType: WorkspaceType) => void;
  readonly readonly?: boolean;
}

interface ConnectorCard {
  readonly type: WorkspaceType;
  readonly name: string;
  readonly description: string;
}

const CARDS: ConnectorCard[] = [
  {
    type: 'DATA',
    name: 'Data (Retrieval Augmented Generation)',
    description:
      'Indexes files in s3 and provides similarity search results as a parameter for the workspace prompt template to allow for data-driven responses.',
  },
  {
    type: 'REQUEST_RESPONSE',
    name: 'Request Response',
    description:
      'A simple workspace managing a prompt to a model. Useful for tasks such as condensing chat history into a single context-aware question.',
  },
  {
    type: 'ROUTER',
    name: 'Router',
    description: 'Use the language model to select the appropriate workspace given a question.',
  },
];
const CARDS_BY_TYPE = Object.fromEntries(CARDS.map((c) => [c.type, c]));

export const WorkspaceTypeSelector: FC<WorkspaceTypeSelectorProps> = ({ selectedType, setSelectedType, readonly }) => {
  return (
    <Cards
      selectionType="single"
      onSelectionChange={(e) => setSelectedType(e.detail.selectedItems[0].type)}
      selectedItems={selectedType ? [CARDS_BY_TYPE[selectedType]] : []}
      items={CARDS}
      isItemDisabled={() => !!readonly}
      cardDefinition={{
        header: (item) => item.name,
        sections: [
          {
            header: 'Description',
            content: (item) => item.description,
          },
        ],
      }}
    />
  );
};
