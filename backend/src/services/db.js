import { MongoClient, GridFSBucket } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let userClient, documentClient;
let userDB, documentDB, bucket;

export async function connectDB() {
  try {
    userClient = new MongoClient(process.env.MONGODB_URI_USER);
    await userClient.connect();
    userDB = userClient.db()

    documentClient = new MongoClient(process.env.MONGODB_URI);
    await documentClient.connect();
    documentDB = documentClient.db();

    bucket = new GridFSBucket(documentDB, {bucketName: "uploads"});
    console.log("✅ Connected to MongoDB (userDB & documentDB)");

  } catch (err) {
    console.error("❌ Failed to connect MongoDB:", err);
  }
}

export function getUserDB() {
  if (!userDB) throw new Error("❌ User DB not connected");
  return userDB;
}

export function getDocumentDB() {
  if (!documentDB) throw new Error("❌ Document DB not connected");
  return documentDB;
}

export function getBucket() {
  if (!bucket) throw new Error("GridFS bucket not initialized");
  return bucket;
}


// ------------------------------KODE LAMA-------------------------------------
// const client = new MongoClient(process.env.MONGODB_URI);

// export async function getDb() {
//   if (!client.topology || !client.topology.isConnected()) {
//     await client.connect();
//   }
//   return client.db(process.env.DB_NAME || client.options?.dbName);
// }

// // ➕ GridFS bucket untuk simpan/stream file
// export async function getBucket() {
//   const db = await getDb();
//   return new GridFSBucket(db, { bucketName: "uploads" });
// }
