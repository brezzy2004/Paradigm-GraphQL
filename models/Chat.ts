import mongoose, { Schema, model } from 'mongoose';
const ChatSchema = new Schema({
  chat_id: { type: String, required: true, unique: true },
  kind: { type: String, enum: ['group', 'project'], required: true },
  group_number: { type: Number, required: true },
  project_serial: { type: String, default: null },
  user_initials: { type: String, required: true },
  kb_selected_id: { type: String, default: null },
  has_sent_message: { type: Boolean, default: false },
  lock_until: { type: Date, default: null },
}, { timestamps: true });
export const Chats = mongoose.models.Chats || model('Chats', ChatSchema);
