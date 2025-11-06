import { getDocumentDB } from "../services/db.js";


export function letterChunks(db) {
    const database = db || getDocumentDB();
    return database.collection("letter_chunks")
}

export async function insertChunk(chunk, db) {
    const col = letterChunks(db);
    const result = await col.insertOne(chunk);
    return { _id: result.insertedId, ...chunk };
}

export async function findAllChunks(limit = 50, db) {
    const col = letterChunks(db);
    return await col.find({}).limit(limit).toArray();
}


/* export const letterChunks = {
    async findAll() {
        const db = getDocumentDB();
        return await db.collection("letter_chunks").find.toArray();
    },
}; */


// ------------KODE LAMA----------------
// export function letterChunks(db) {
//     return db.collection("letter_chunks");
// }