import { Client } from 'minio';
const {
  S3_ENDPOINT='localhost', S3_PORT='9000', S3_USE_SSL='false',
  S3_ACCESS_KEY='minioadmin', S3_SECRET_KEY='minioadmin', S3_BUCKET='paradigm-kb'
} = process.env;
export const minio = new Client({
  endPoint: S3_ENDPOINT, port: parseInt(S3_PORT,10), useSSL: S3_USE_SSL==='true',
  accessKey: S3_ACCESS_KEY, secretKey: S3_SECRET_KEY,
});
export async function ensureBucketAndCors() {
  const exists = await minio.bucketExists(S3_BUCKET).catch(()=>false);
  if (!exists) { await minio.makeBucket(S3_BUCKET, 'us-east-1'); }
  return true;
}
