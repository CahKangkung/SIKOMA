import { MongoClient, GridFSBucket } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

export async function getDb() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(process.env.DB_NAME || client.options?.dbName);
}

// ➕ GridFS bucket untuk simpan/stream file
export async function getBucket() {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: "uploads" });
}
