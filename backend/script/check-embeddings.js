// scripts/check-embeddings.js
import { getDocumentDB } from "../src/services/db.js";
import { letterChunks } from "../src/models/letterChunks.js";

(async () => {
  const db = await getDocumentDB();
  const col = letterChunks(db);

  // total semua dokumen
  const total = await col.countDocuments();

  // yang punya embedding array
  const withEmbedding = await col.countDocuments({ embedding: { $type: "array" } });

  console.log(`📊 Total dokumen: ${total}`);
  console.log(`📈 Dokumen dengan embedding: ${withEmbedding}`);

  // tampilkan satu contoh
  const sample = await col.findOne(
    { embedding: { $type: "array" } },
    { projection: { text: 1, "embedding.0": 1, "embedding.767": 1 } }
  );
  console.log("🧠 Contoh dokumen dengan embedding:");
  console.log(sample);

  process.exit(0);
})();
