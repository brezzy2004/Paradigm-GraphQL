import mongoose, { Schema, model } from 'mongoose';
const FileSchema = new Schema({
  file_id: { type: String, required: true, unique: true },
  chat_id: { type: String, required: true },
  chat_type: { type: String, enum: ['group','project'], required: true },
  project_serial: { type: String, default: null },
  group_number: { type: Number, required: true },
  user_sys_id: { type: String, required: true },
  file_name: { type: String, required: true },
  file_type: { type: String, required: true },
  mime_type: { type: String, required: true },
  s3_key: { type: String, required: true },
  upload_status: { type: String, default: 'ready' }
}, { timestamps: true });
export const Files = mongoose.models.Files || model('Files', FileSchema);
