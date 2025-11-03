import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import mongoose from 'mongoose';
import { MongoClient } from "mongodb";

dotenv.config();

// routes
import ingestRoutes from "./routes/ingest.routes.js";
import searchRoutes from "./routes/search.routes.js";
import docsRoutes from "./routes/docs.routes.js";
import filesRoutes from "./routes/files.routes.js";
import userRoutes from "./routes/userRoutes.js";
import db from "./models/User.js";

// app init 
const app = express();

// middlewares
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json({ limit: "25mb" }));
app.use(morgan("dev"));
app.use(cookieParser());

// routes
app.use("/api", ingestRoutes);
app.use("/api", searchRoutes);
app.use("/api", docsRoutes);
app.use("/api", filesRoutes);

// error handler 
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal error" });
});

// database connection 
const MONGO_URI_USER = process.env.MONGODB_URI_USER; // untuk user model 
const MONGO_URI_LETTERS = process.env.MONGODB_URI; // untuk letter chunks
const DB_NAME = process.env.DB_NAME || "letter-chunks"

const connectDB = async () => {
    try {
        // connect mongoose (untuk autentikasi & user.js)
        await mongoose.connect(MONGO_URI_USER);
        console.log("Mongoose connected (User DB)");

        // connect mongoclient (untuk letterChunks)
        const client = new MongoClient(MONGO_URI_LETTERS);
        await client.connect();
        const dbb = client.db(DB_NAME);

        // simpan ke global app agar bisa diakses di controller 
        app.locals.db = db;
        
        console.log(`MongoClient connected (DB: ${DB_NAME})`);
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }
};

connectDB();

app.use("/api/auth", userRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on :${process.env.PORT}`);
});