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

/// Delete a workflow
@idempotent
@http(method: "DELETE", uri: "/workflow/{workflowId}")
@tags(["default", "workflow"])
operation DeleteWorkflow {
    input := {
      /// ID of the workflow to delete
      @httpLabel
      @required
      workflowId: WorkflowId
    }
    output := {
      @required
      workflowId: WorkflowId
    }
    errors: [NotFoundError]
}