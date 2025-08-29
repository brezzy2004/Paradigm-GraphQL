import mongoose, { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  user_sys_id: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'super_admin', 'team'], default: 'team' },
  assigned_group: { type: Number, default: 1 },
  assigned_groups_ids: [{ type: String }],
  failed_logins: { type: Number, default: 0 },
  locked_until: { type: Date, default: null },
}, { timestamps: true });

export const Users = mongoose.models.Users || model('Users', UserSchema);
