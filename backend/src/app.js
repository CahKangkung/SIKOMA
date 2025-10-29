import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import ingestRoutes from "./routes/ingest.routes.js";
import searchRoutes from "./routes/search.routes.js";
import docsRoutes from "./routes/docs.routes.js";
import filesRoutes from "./routes/files.routes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(morgan("dev"));

app.use("/api", ingestRoutes);
app.use("/api", searchRoutes);
app.use("/api", docsRoutes);
app.use("/api", filesRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "internal error" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on :${process.env.PORT}`);
});