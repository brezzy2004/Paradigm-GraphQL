import mongoose, { Schema, model } from 'mongoose';
const InstructionSchema = new Schema({
  instruction_id: { type: String, unique: true },
  kb_id: { type: String, required: true },
  project_serial: { type: String, required: true },
  group_number: { type: Number, required: true },
  created_by_user_sys_id: { type: String, required: true },
  instruction_name: { type: String, required: true },
  instruction_content: { type: String, required: true },
}, { timestamps: true });
export const Instructions = mongoose.models.Instructions || model('Instructions', InstructionSchema);
