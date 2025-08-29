import { createSchema } from 'graphql-yoga';

export const typeDefs = /* GraphQL */ `
  scalar Date

  enum Role { admin super_admin team }
  enum ChatType { group project }

  type User { id: ID! user_sys_id: String! name: String! email: String! role: Role! assigned_group: Int! }
  type Group { number: Int! name: String! sys_id: String! }
  type Project { serial: String! sys_id: String! name: String! group_number: Int! }
  type Chat { chat_id: ID! kind: ChatType! group_number: Int! project_serial: String user_initials: String! kb_selected_id: String has_sent_message: Boolean! lock_until: Date }
  type File { file_id: ID! chat_id: ID! chat_type: ChatType! file_name: String! file_type: String! mime_type: String! s3_key: String! upload_status: String! }
  type KnowledgeBase { kb_id: ID! name: String! project_serial: String! group_number: Int! file_type: String! upload_status: String! mcp_processed: Boolean! additive_sequence: Int! }
  type Instruction { instruction_id: ID! kb_id: ID! project_serial: String! group_number: Int! instruction_name: String! instruction_content: String! }
  type Message { message_id: ID! chat_id: ID! chat_type: ChatType! user_sys_id: String! selected_kb_id: String user_message: String! ai_response: String response_metadata: JSON createdAt: Date }
  scalar JSON

  type Session { sessionId: ID! refreshToken: String! expiresAt: Date! }
  type AuthPayload { token: String! refresh: Session! user: User! dashboard_route: String! }

  type ValidateSession { valid: Boolean! user: User dashboard_route: String }

  type Query {
    me: User
    userGroups: [Group!]!
    validateSession(token: String!): ValidateSession!
    getUserGroups: [Group!]!
    getGroupAccess(userId: ID!): [Group!]!

    # Green services queries
    listProjects(group_number: Int!): [Project!]!
    projectDetails(project_serial: String!): Project
    listProjectChats(project_serial: String!): [Chat!]!
    listGroupChats(group_number: Int!): [Chat!]!
    groupChatHistory(chat_id: ID!): [Message!]!
    projectChatHistory(chat_id: ID!): [Message!]!
    listFiles(chat_id: ID!): [File!]!
    listKB(project_serial: String!): [KnowledgeBase!]!
    getInstruction(kb_id: ID!): Instruction
  }

  input LoginInput { email: String!, password: String! }
  input ChangePasswordInput { currentPassword: String!, newPassword: String! }
  input CreateProjectInput { name: String!, group_number: Int! }
  input CreateGroupChatInput { group_number: Int! }
  input CreateProjectChatInput { project_serial: String!, group_number: Int!, kb_id: ID }
  input SendGroupMessageInput { chat_id: ID!, message: String! }
  input SendProjectMessageInput { chat_id: ID!, message: String! }
  input UploadToChatInput { chat_id: ID!, file_name: String!, file_type: String!, mime_type: String!, contentBase64: String! }
  input CreateKBInput { project_serial: String!, group_number: Int!, name: String!, file_type: String! }
  input CreateInstructionInput { kb_id: ID!, project_serial: String!, group_number: Int!, instruction_name: String!, instruction_content: String! }
  input UpdateInstructionInput { instruction_id: ID!, instruction_name: String, instruction_content: String }
  input KBSelectionUpdateInput { chat_id: ID!, kb_id: ID! }

  type Mutation {
    startTyping(chat_id: ID!): Boolean!
    endTyping(chat_id: ID!): Boolean!

    # black services
    login(input: LoginInput!): AuthPayload!
    logout(refreshToken: String!): Boolean!
    refreshToken(refreshToken: String!): AuthPayload!
    changePassword(input: ChangePasswordInput!): Boolean!

    # green services
    createProject(input: CreateProjectInput!): Project!
    deleteProject(project_serial: String!): Boolean!

    createGroupChat(input: CreateGroupChatInput!): Chat!
    createProjectChat(input: CreateProjectChatInput!): Chat!
    sendGroupMessage(input: SendGroupMessageInput!): Message!
    sendProjectMessage(input: SendProjectMessageInput!): Message!
    uploadToChat(input: UploadToChatInput!): File!
    createKB(input: CreateKBInput!): KnowledgeBase!
    deleteKB(kb_id: ID!): Boolean!
    createInstruction(input: CreateInstructionInput!): Instruction!
    updateInstruction(input: UpdateInstructionInput!): Instruction!
    deleteInstruction(instruction_id: ID!): Boolean!
    updateKBSelection(input: KBSelectionUpdateInput!): Chat!
  }
`;
