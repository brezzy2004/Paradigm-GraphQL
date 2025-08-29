import bcrypt from 'bcryptjs';
import { connectMongo } from '../lib/db';
import { Users } from '../models/User';
import { Groups } from '../models/Group';
import { userId, groupId } from '../lib/ids';

export async function seedUsersAndGroups() {
  await connectMongo();
  if (await Users.countDocuments() > 0) return;

  const mk = 'MK', ay = 'AY', ab = 'AB';
  // Create groups with MK initials
  await Groups.create([
    { number: 1, name: 'Paradigm/Dev-Group-1', sys_id: groupId(1, mk) },
    { number: 2, name: 'Paradigm/Dev-Group-2', sys_id: groupId(2, mk) },
    { number: 3, name: 'Paradigm/Dev-Group-3', sys_id: groupId(3, mk) },
  ]);

  const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'amit@example.com';
  const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  const SEED_SUPERADMIN_EMAIL = process.env.SEED_SUPERADMIN_EMAIL || 'mikael@example.com';
  const SEED_SUPERADMIN_PASSWORD = process.env.SEED_SUPERADMIN_PASSWORD || 'Super@123';
  const SEED_TEAM_EMAIL = process.env.SEED_TEAM_EMAIL || 'amir@example.com';
  const SEED_TEAM_PASSWORD = process.env.SEED_TEAM_PASSWORD || 'Team@123';

  await Users.create([
    { user_sys_id: userId(ay), name: 'Amit Yadav', email: SEED_ADMIN_EMAIL, password_hash: await bcrypt.hash(SEED_ADMIN_PASSWORD, 10), role: 'admin', assigned_group: 1, assigned_groups_ids: [] },
    { user_sys_id: userId(mk), name: 'Mikael Kayanian', email: SEED_SUPERADMIN_EMAIL, password_hash: await bcrypt.hash(SEED_SUPERADMIN_PASSWORD, 10), role: 'super_admin', assigned_group: 1, assigned_groups_ids: [] },
    { user_sys_id: userId(ab), name: 'Amir Bershad', email: SEED_TEAM_EMAIL, password_hash: await bcrypt.hash(SEED_TEAM_PASSWORD, 10), role: 'team', assigned_group: 1, assigned_groups_ids: [] },
  ]);
}
