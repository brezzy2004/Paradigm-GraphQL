import mongoose, { Schema, model } from 'mongoose';
const MessageSchema = new Schema({
  message_id: { type: String, unique: true },
  chat_id: { type: String, required: true },
  chat_type: { type: String, enum: ['group','project'], required: true },
  project_serial: { type: String, default: null },
  group_number: { type: Number, required: true },
  user_sys_id: { type: String, required: true },
  selected_kb_id: { type: String, default: null },
  user_message: { type: String, required: true },
  ai_response: { type: String, default: '' },
  response_metadata: { type: Object, default: {} },
}, { timestamps: true });
export const Messages = mongoose.models.Messages || model('Messages', MessageSchema);
