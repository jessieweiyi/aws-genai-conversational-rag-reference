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

string WorkflowId

structure WorkflowDefinition {
  /// Ordered list of workspace ids, representing the sequence of workspaces for inference
  @required
  workspaceIds: WorkspaceIds
}

@mixin
structure WorkflowDetails {
  /// Name of the workflow
  @required
  name: String
  /// Description of the workflow
  description: String
  /// Definition of the workflow
  @required
  definition: WorkflowDefinition
}

/// Represents a workflow, consisting of a sequence of workspaces
structure Workflow with [WorkflowDetails] {
  @required
  workflowId: WorkflowId

  createdAt: Integer

  userId: String
}

list Workflows {
  member: Workflow
}