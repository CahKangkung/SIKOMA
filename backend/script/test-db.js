import { getDocumentDB } from "../src/services/db.js";

(async () => {
  try {
    const db = await getDocumentDB();
    console.log("✅ MongoDB connected:", db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log("📁 Collections:", collections.map(c => c.name));
  } catch (e) {
    console.error("❌ Error connecting to MongoDB:", e);
  } finally {
    process.exit(0);
  }
})();
