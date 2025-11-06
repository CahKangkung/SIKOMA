import { ObjectId } from "mongodb";
import { getDocumentDB } from "../services/db.js";

export function LetterModel(db) {
    const database = db || getDocumentDB();
    return database.collection("letters");
}

// ambil semua dokumen milik organisasi
export async function lettersFindByOrg(orgId, db) {
    const col = LetterModel(db);
    return await col
        .find({ organizationId: new ObjectId(orgId) })
        .sort({ createdAt: -1 })
        .toArray();
}

// insert dokumen baru
export async function lettersCreate(letter, db) {
    const col = LetterModel(db);
    const result = await col.insertOne(letter);
    return { _id: result.insertedId, ...letter };    
}

// hapus dokumen
export async function lettersDeleteById(id, orgId, db) {
    const col = LetterModel(db);
    return await col.deleteOne({
        _id: new ObjectId(id),
        organizationId: new ObjectId(orgId)
    });
}

/*export const LetterModel = {
    async findByOrg(orgId) {
        const db = getDocumentDB();
        return await db
            .collection("letters")
            .find({ organizationId: new ObjectId(orgId) })
            .toArray();
    },

    async create(letter) {
        const db = getDocumentDB();
        const result = await db.collection("letters").insertOne(letter);
        return result;
    },

    // async findByOrg(orgId) {
    //     const db = getDocumentDB();
    //     return await db.collection("letters")
    //         .find({ organizationId: new ObjectId(orgId) })
    //         .sort({ createdAt: -1 })
    //         .toArray();
    // },

    // async findByOrgId(id, orgId) {
    //     const db = getDocumentDB();
    //     return await db.collection("letters").findOne({
    //         _id: new ObjectId(id),
    //         organizationId: new ObjectId(orgId)
    //     });
    // },

    async deleteById(id, orgId) {
        const db = getDocumentDB();
        return await db.collection("letters").deleteOne({
            _id: new ObjectId(id),
            organizationId: new ObjectId(orgId)
        });
    },    
};*/

// --------------KODE LAMA--------------------
// export function letters(db) {
//     return db.collection("letters");
// }