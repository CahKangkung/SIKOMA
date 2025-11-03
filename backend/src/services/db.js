import { MongoClient, GridFSBucket } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const client = new MongoClient(process.env.MONGO_URI);

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
