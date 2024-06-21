/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
// import { useMutation } from '@tanstack/react-query';
// import { DefaultApiClientContext, DefaultApiDefaultContext } from 'api-typescript-react-query-hooks';
// import chunk from 'lodash/chunk';
// import { useContext } from 'react';

export interface FileDetails {
  readonly file: File;
}

export interface UploadWorkspaceFilesProps {
  readonly workspaceId: string;
  readonly files: FileDetails[];
}

export interface UploadWorkspaceFilesOptions {
  readonly batchSize?: number;
}

// const uploadFile = async (url: string, file: File) => {
//   await fetch(url, {
//     method: 'put',
//     body: file,
//     headers: {
//       'content-type': file.type,
//     },
//   });
// };

// export const useUploadWorkspaceFiles = (options?: UploadWorkspaceFilesOptions) => {
//   const api = useContext(DefaultApiClientContext);
//   if (!api) {
//     throw new Error('Api client missing');
//   }

//   const batchSize = options?.batchSize ?? 10;

//   return useMutation(
//     async ({ workspaceId, files }: UploadWorkspaceFilesProps) => {
//       for (const batch of chunk(files, batchSize)) {
//         await Promise.all(
//           batch.map(async (file) => {
//             const { uploadUrl } = await api.createWorkspaceFile({
//               workspaceId,
//               createWorkspaceFileRequestContent: {
//                 fileName: file.file.name,
//                 metadata: file.metadata,
//               },
//             });
//             await uploadFile(uploadUrl, file.file);
//           }),
//         );
//       }
//     },
//     {
//       context: DefaultApiDefaultContext as any,
//     },
//   );
// };
