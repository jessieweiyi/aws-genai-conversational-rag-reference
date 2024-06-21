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

/// Search a workspace corpus for relevant documents
@readonly
@http(method: "POST", uri: "/workspace/{workspaceId}/search")
@tags(["default", "workspace"])
operation WorkspaceCorpusSearch {
    input:= {
      /// ID of the workspace
      @required
      @httpLabel
      workspaceId: WorkspaceId

      /// Include the score in the response
      @httpQuery("withScore")
      withScore: Boolean

      /// The query used to search the corpus
      @required
      query: String

      /// Number of search results to return
      k: Integer

      /// JSON object with metadata filter to apply to search
      filter: Any

      /// Distance strategy to use for similarity search
      distanceStrategy: DistanceStrategy
    }
    output:= {
      /// List of matching documents
      @required
      documents: Documents
    }
}