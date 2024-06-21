// **********************************************************************************************************************
// *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.                                                *
// *                                                                                                                    *
// *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        *
// *  with the License. A copy of the License is located at                                                             *
// *                                                                                                                    *
// *     https://aws.amazon.com/asl/                                                                                    *
// *                                                                                                                    *
// *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES *
// *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
// *  and limitations under the License.                                                                                *
// **********************************************************************************************************************

$version: "2"
namespace com.amazon

/// Connector for an existing S3 bucket/path
structure S3DataConnector {
  /// Format: s3://<bucket>/<key>
  @required
  s3Path: String
}

/// Connector for uploading files (to a bucket managed by the application)
structure FileUploadDataConnector {

}

/// Represents a workspace connection to a data source
union DataConnector {
  s3: S3DataConnector
  fileUpload: FileUploadDataConnector
}
