import 'dotenv/config';
import { ensureBucketAndCors } from '../lib/minio';

(async () => {
  try {
    await ensureBucketAndCors();
    console.log('✅ Storage ready (bucket + CORS)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to init storage:', (err as Error).message);
    process.exit(1);
  }
})();
