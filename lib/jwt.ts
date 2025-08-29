import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Sessions } from '../models/Sessions';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '900s';
const REFRESH_EXPIRES_IN_DAYS = parseInt(process.env.REFRESH_EXPIRES_IN_DAYS || '30', 10);

export function signJWT(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
export function verifyJWT<T=any>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}

export async function createRefreshSession(userId: Types.ObjectId) {
  const raw = randomUUID() + randomUUID();
  const hash = await bcrypt.hash(raw, 10);
  const now = new Date();
  const exp = new Date(now.getTime() + REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);
  const doc = await Sessions.create({ user_id: userId, jwt_token_hash: hash, expires_at: exp, status: 'active' });
  return { refreshToken: raw, sessionId: doc._id.toString(), expiresAt: exp };
}

export async function revokeRefreshSession(raw: string) {
  const all = await Sessions.find({});
  for (const s of all) {
    if (await bcrypt.compare(raw, s.jwt_token_hash)) { s.status = 'revoked'; await s.save(); return true; }
  }
  return false;
}

export async function validateRefreshToken(raw: string) {
  const all = await Sessions.find({ status: 'active' });
  for (const s of all) {
    if (await bcrypt.compare(raw, s.jwt_token_hash)) { if (s.expires_at < new Date()) return null; return s; }
  }
  return null;
}
