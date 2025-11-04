import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import mongoose from 'mongoose';
import { MongoClient } from "mongodb";

dotenv.config();

// routes
import ingestRoutes from "./src/routes/ingest.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import docsRoutes from "./src/routes/docs.routes.js";
import filesRoutes from "./src/routes/files.routes.js";
import userRoutes from "./src/routes/userRoutes.js";
import organizationRoutes from "./src/routes/organizationRoutes.js";
import db from "./src/models/User.js";

// middlewares
import authMiddleware from "./src/middlewares/authMiddleware.js";

// app init 
const app = express();

// middlewares
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
    })
);
app.use(express.json({ limit: "25mb" }));
app.use(morgan("dev"));
app.use(cookieParser());

// routes
app.use("/api/auth", userRoutes);
app.use("/api/organization", authMiddleware, organizationRoutes);
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
// const DB_NAME = process.env.DB_NAME || "letter-chunks"

const connectDBB = async () => {
    try {
        // connect mongoose (untuk autentikasi & user.js)
        await mongoose.connect(MONGO_URI_USER);
        console.log("Mongoose connected (User DB)");

        // connect mongoclient (untuk letterChunks)
        const client = new MongoClient(MONGO_URI_LETTERS);
        await client.connect();
        // const dbb = client.db(DB_NAME);
        const dbb = client.db();

        // simpan ke global app agar bisa diakses di controller 
        app.locals.db = dbb;
        
        // console.log(`MongoClient connected (DB: ${DB_NAME})`);
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }
};

connectDBB();

app.listen(process.env.PORT, () => {
    console.log(`Server running on : ${process.env.PORT}`);
});

