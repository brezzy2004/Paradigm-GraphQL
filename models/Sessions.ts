import mongoose, { Schema, model } from 'mongoose';
const SessionsSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  jwt_token_hash: { type: String, required: true },
  expires_at: { type: Date, required: true },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' }
}, { timestamps: true });
export const Sessions = mongoose.models.Sessions || model('Sessions', SessionsSchema);
