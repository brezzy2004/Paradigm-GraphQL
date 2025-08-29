import mongoose, { Schema, model } from 'mongoose';
const ProjectSchema = new Schema({
  serial: { type: String, required: true, unique: true }, // 6-digit
  sys_id: { type: String, unique: true }, // PRJ-serial/DGP-#/XX
  name: { type: String, required: true },
  group_number: { type: Number, required: true },
  created_by_user_id: { type: Schema.Types.ObjectId, ref: 'Users' },
  kb_upload_lock_until: { type: Date, default: null },
}, { timestamps: true });
export const Projects = mongoose.models.Projects || model('Projects', ProjectSchema);
