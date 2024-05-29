/*! Copyright [Amazon.com](http://amazon.com/), Inc. or its affiliates. All Rights Reserved.
PDX-License-Identifier: Apache-2.0 */
export const GITHUB = {
  ORG: 'aws-samples',
  REPOSITORY: 'aws-genai-conversational-rag-reference',
};

export const PROJECT_AUTHOR = {
  author: 'AWS APJ COPE',
  authorAddress: 'apj-cope@amazon.com',
  authorName: 'AWS APJ COPE',
  authorEmail: 'apj-cope@amazon.com',
  repositoryUrl: `https://github.com/${GITHUB.ORG}/${GITHUB.REPOSITORY}`,
} as const;

export const DEFAULT_RELEASE_BRANCH = 'mainline';

export const DEMO_OUTDIR = 'demo';

export const DEMO_APPLICATION_NAME = 'Galileo';

/** Managed Dependency Versions */
export const VERSIONS = {
  CDK: '2.137.0',
  CONSTRUCTS: '10.3.0',
  PDK: '0.23.33',
  LANGCHAIN: '0.1.36',
  LANGCHAIN_CORE: '0.1.62',
  LANGCHAIN_COMMUNITY: '0.0.55',
} as const;
