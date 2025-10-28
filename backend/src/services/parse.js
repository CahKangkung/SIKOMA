import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // ✅ CommonJS import

import mammoth from "mammoth";

export async function parsePdf(buffer) {
  const res = await pdfParse(buffer);
  return res.text || "";
}

export async function parseDocx(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value || "";
}