import mongoose from 'mongoose';
const { MONGODB_URI = 'mongodb+srv://blackuser:7yV462x1ie39dba5@db-mongodb-lon1-46072-f3f7b7a5.mongo.ondigitalocean.com/krypton?tls=true&authSource=admin&replicaSet=db-mongodb-lon1-46072&retryWrites=true&w=majority', MONGODB_DBNAME='krypton' } = process.env;
declare global { var _mongooseConn: Promise<typeof mongoose> | undefined; }
export function connectMongo() {
  if (!global._mongooseConn) {
    mongoose.set('strictQuery', true);
    global._mongooseConn = mongoose.connect(MONGODB_URI!, { dbName: 'krypton' });
  }
  return global._mongooseConn;
}
