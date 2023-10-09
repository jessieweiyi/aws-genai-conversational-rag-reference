// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".
/* eslint-disable */
import * as path from 'path';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { IConstruct } from 'constructs';

/**
 * Asset path for src/ai/llms/models/falcon/lite/image.asset
 */
export const IMAGE_ASSET_PATH = path.join(__dirname, '../../../../../../assets/ai/llms/models/falcon/lite/image');

/**
 * Asset construct for src/ai/llms/models/falcon/lite/image.asset
 */
export class ImageAsset extends Asset {
  constructor(scope: IConstruct, id: string) {
    super(scope, id, {
      "path": IMAGE_ASSET_PATH,
    })
  }
}