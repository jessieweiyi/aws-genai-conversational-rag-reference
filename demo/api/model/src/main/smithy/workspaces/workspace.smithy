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

string WorkspaceId

@mixin
structure WorkspaceIdMixin {
    @required
    workspaceId: String
}

list WorkspaceIds {
  member: WorkspaceId
}

/// Type of workspace
enum WorkspaceType {
  /// Containing a language model, prompt and data, optionally with a vector store and embeddings model
  DATA = "DATA"
  /// A simple workspace with only a language model and prompt
  REQUEST_RESPONSE = "REQUEST_RESPONSE"
  /// Workspace which uses its language model to route to other workspaces
  ROUTER = "ROUTER"
}

/// A prompt within a workspace
structure WorkspacePrompt {
  /// Handlebars prompt template
  @required
  promptTemplate: String
}

@mixin
structure WorkspaceEditableDetails {
  /// Name of the workspace
  @required
  name: String

  /// Description of the workspace
  description: String

  /// Chat model used by the workspace
  @required
  chatModel: ChatModel

  /// Prompt used by the workspace
  prompt: WorkspacePrompt

  /// The workspace definiton for Router workspace type
  routerDefinition: RouterWorkspaceDefinition
}

/// Represents indexing in a workspace
structure DataWorkspaceIndexing {
  /// The vector storage engine used
  @required
  vectorStorage: VectorStorage
  @required
  embeddingModel: WorkspaceEmbeddingModel
}

/// Workspace definition for DATA type workspaces
structure DataWorkspaceDefinition {
  /// Optional indexing - if not set, workspace files can be referenced directly in the prompt template
  indexing: DataWorkspaceIndexing
}

/// Represents a workspace which is routed to
structure RouterWorkspace {
  /// ID of the workspace
  @required
  id: WorkspaceId

  /// A description of the workspace, which may be referenced in the prompt template to assist in the model's
  /// routing decision
  @required
  description: String
}

list RouterWorkspaces {
  member: RouterWorkspace
}

/// Workspace definition for ROUTER type workspaces
structure RouterWorkspaceDefinition {
  /// List of route targets
  @required
  workspaces: RouterWorkspaces
}

@mixin
structure WorkspaceDetails with [WorkspaceEditableDetails] {
  /// The type of workspace
  @required
  type: WorkspaceType

  /// The workspace definiton for Data workspace type
  data: DataWorkspaceDefinition
}

/// Status of a workspace data import and indexing job
enum WorkspaceDataImportStatus {
  NOT_STARTED = "NOT_STARTED"
  IN_PROGRESS = "IN_PROGRESS"
  FAILURE = "FAILURE"
  SUCCESS = "SUCCESS"
}

/// Details about a workspace data import job
structure WorkspaceDataImport {
  /// Status of the job
  @required
  status: WorkspaceDataImportStatus

  /// Error message if the job status is FAILURE
  statusDetails: String
}

/// Represents a workspace
structure Workspace with [WorkspaceDetails] {
  /// ID of the workspace
  @required
  workspaceId: WorkspaceId

  /// Details about the data import job
  dataImport: WorkspaceDataImport
  
  createdAt: Integer

  userId: String
}

list Workspaces {
  member: Workspace
}

/// Metadata associated with a file as key/value pairs
map FileMetadata {
  key: String
  value: String
}

@mixin
structure FileDetailsMixin {
  /// Name of the file
  @required
  fileName: String

  /// Metadata associated with the file
  @required
  metadata: FileMetadata
}

/// Details about a file within a workspace
structure FileDetails with [FileDetailsMixin] {
  /// User who most recently updated the file
  updatedBy: CallingIdentity

  /// Time at which the file was updated
  updatedAt: EpochTimestamp

  /// Presigned url to download the file
  downloadUrl: String
}

list FileDetailsList {
  member: FileDetails
}
