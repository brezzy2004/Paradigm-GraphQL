import mongoose, { Schema, model } from 'mongoose';
const ChatHistorySchema = new Schema({
  history_id: { type: String, unique: true },
  parent_chat_id: { type: String, required: true },
  chat_type: { type: String, enum: ['group','project'], required: true },
  project_serial: { type: String, default: null },
  group_number: { type: Number, required: true },
  user_sys_id: { type: String, required: true },
  selected_kb_id: { type: String, default: null },
  message_content: { type: String, required: true },
  kb_references: [{ type: String }],
  message_timestamp: { type: Date, default: () => new Date() },
}, { timestamps: true });
export const ChatHistory = mongoose.models.ChatHistory || model('ChatHistory', ChatHistorySchema);
