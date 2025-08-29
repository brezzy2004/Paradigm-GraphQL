import fs from 'fs';
import { ensureBucketAndCors } from './minio';
import { connectMongo } from './db';
import { seedUsersAndGroups } from '../scripts/seed-func';
export function isContainer() {
  try {
    if (fs.existsSync('/.dockerenv')) return true;
    const cgroup = fs.readFileSync('/proc/1/cgroup','utf8');
    if (/docker|kubepods|containerd/i.test(cgroup)) return true;
  } catch {}
  return process.env.CONTAINERIZED === '1';
}
export async function selfTriggerInit() {
  if (!isContainer()) return;
  await connectMongo();
  await ensureBucketAndCors();
  await seedUsersAndGroups();
  console.log('[SelfTrigger] Initialization completed.');
}
