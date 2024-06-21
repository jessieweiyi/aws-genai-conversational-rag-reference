$version: "2"

namespace com.amazon

// 
// Mixins
// 
@mixin
structure ChatIdMixin {
    @required
    chatId: String
}

@mixin
structure ChatDetailsMixin {
    // Title of the chat session
    @required
    title: String
    // User ID of the creator of the chat session
    @required
    userId: String
    // Workflow Id of the chat
    workflowId: String
    // Workflow Type of the chat
    workflowType: String
    // Creation datetime
    createdAt: EpochTimestamp
}

// 
// structures
// 
structure Chat with [ChatIdMixin, ChatDetailsMixin] {}

list Chats {
    member: Chat
}

// 
// operations
// 
/// List Chats for a user
@input
structure ListChatsInput for ChatResource {}

structure ListChatsOutput for ChatResource {
    chats: Chats
}

@readonly
@http(method: "GET", uri: "/chat")
operation ListChats {
    input: ListChatsInput
    output: ListChatsOutput
    errors: [ServerError, ClientError]
}

/// Type of flow to service the chat
enum ChatFlowType {
  /// Point the chat to a workflow to handle incoming messages
  WORKFLOW = "WORKFLOW"
  /// Point a chat directly at a workspace, useful for debugging. Equivalent to a workflow with a single workspace
  WORKSPACE = "WORKSPACE"
}

/// Represents a workflow or workspace used to service a chat
structure ChatWorkflow {
  /// Workspace or workflow ID
  @required
  id: String

  /// Workspace or workflow
  @required
  type: ChatFlowType
}

/// Create a chat session for a user
@input
structure CreateChatInput for CreateChat {
    // Title of the chat session
    @required
    title: String

    @required
    workflow: ChatWorkflow
}

structure CreateChatOutput for CreateChat with [ChatIdMixin, ChatDetailsMixin] {}

@idempotent
@http(method: "PUT", uri: "/chat")
operation CreateChat {
    input: CreateChatInput
    output: CreateChatOutput
    errors: [ServerError, ClientError]
}

// Update the title of the chat
@input
structure UpdateChatInput for UpdateChat {
    @required
    @httpLabel
    chatId: String
    // Title of the chat session
    @required
    title: String
}

structure UpdateChatOutput for UpdateChat with [ChatIdMixin, ChatDetailsMixin] {}

@idempotent
@http(method: "POST", uri: "/chat/{chatId}")
operation UpdateChat {
    input: UpdateChatInput
    output: UpdateChatOutput
    errors: [ServerError, ClientError]
}

// Delete the title of the chat
@input
structure DeleteChatInput for DeleteChat {
    @required
    @httpLabel
    chatId: String
}

structure DeleteChatOutput for DeleteChat with [ChatIdMixin] {}

@idempotent
@http(method: "DELETE", uri: "/chat/{chatId}")
operation DeleteChat {
    input: DeleteChatInput
    output: DeleteChatOutput
    errors: [ServerError, ClientError]
}

// 
// Resources
// 
resource ChatResource {
    identifiers: {
        chatId: String
    }
    list: ListChats
    create: CreateChat
    update: UpdateChat
    delete: DeleteChat
}
