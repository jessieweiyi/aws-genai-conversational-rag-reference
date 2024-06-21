/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
import { Box, Button } from '@cloudscape-design/components';
import { FC } from 'react';

export interface NoPreviewAvailableProps {
  readonly downloadUrl: string;
}

export const NoPreviewAvailable: FC<NoPreviewAvailableProps> = ({ downloadUrl }) => {
  return (
    <Box textAlign="center" color="inherit">
      <b>No Preview Available</b>
      <Box padding={{ bottom: 's' }} variant="p" color="inherit">
        Previewing this type of document is not supported, but you can download it with the button below.
      </Box>
      <Button download variant="primary" iconName="download" href={downloadUrl}>
        Download
      </Button>
    </Box>
  );
};
