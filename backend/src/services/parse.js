import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // ✅ CommonJS import

// import { pdf } from "pdf-parse"; // post commit 3
import mammoth from "mammoth";

export async function parsePdf(buffer) {
  const res = await pdfParse(buffer);
  // const res = await pdf(buffer); // post commit 3
  return res.text || "";
}

export async function parseDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value || "";
}

// post commit 3
// fungsi tambahan agar kompatibel dengan docs.routes.js
export async function ocrBuffer(buffer, mime, filename = "file") {
  if (mime === "application/pdf") {
    return await parsePdf(buffer);
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) {
    return await parseDocx(buffer);
  }

  console.warn("⚠️ ocrBuffer: unsupported mime type:", mime);
  return "";
}