import mongoose, { Schema, model } from 'mongoose';
const GroupSchema = new Schema({
  number: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  domain: { type: String, default: 'technical' },
  sys_id: { type: String, unique: true }, // DGP/x-serial/initials
}, { timestamps: true });
export const Groups = mongoose.models.Groups || model('Groups', GroupSchema);
