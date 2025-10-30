import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookieParser"; 
import mongoose from mongoose;
dotenv.config();

import ingestRoutes from "./routes/ingest.routes.js";
import searchRoutes from "./routes/search.routes.js";
import docsRoutes from "./routes/docs.routes.js";
import filesRoutes from "./routes/files.routes.js";
import userRoutes from "./routes/userRoutes";

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", ingestRoutes);
app.use("/api", searchRoutes);
app.use("/api", docsRoutes);
app.use("/api", filesRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal error" });
});

// Connect MongoDB
mongoose
    .connect("mongodb+srv://sikoma:sikoma123@cluster0.5ghqr0g.mongodb.net/?appName=Cluster0")
    .then(()=> console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB error", err));

app.use("/api/auth", userRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on :${process.env.PORT}`);
});

