import mongoose, { Schema, model } from 'mongoose';
const KBSchema = new Schema({
  kb_id: { type: String, unique: true },
  name: { type: String, required: true },
  project_serial: { type: String, required: true },
  group_number: { type: Number, required: true },
  created_by_user_sys_id: { type: String, required: true },
  file_type: { type: String, default: '' },
  upload_status: { type: String, enum: ['processing','ready','failed'], default: 'ready' },
  mcp_processed: { type: Boolean, default: false },
  additive_sequence: { type: Number, default: 1 },
  files: [{ type: Schema.Types.ObjectId, ref: 'Files' }],
}, { timestamps: true });
export const KnowledgeBases = mongoose.models.KnowledgeBases || model('KnowledgeBases', KBSchema);
