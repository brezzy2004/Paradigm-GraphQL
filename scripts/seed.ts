import 'dotenv/config';


import { seedUsersAndGroups } from './seed-func';
seedUsersAndGroups().then(()=>{ console.log('Seed complete'); process.exit(0); });
