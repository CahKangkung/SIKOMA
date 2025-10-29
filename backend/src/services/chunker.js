export function chunkText(text, maxTokens = 900, overlap = 120) {
    const words = text.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += (maxTokens - overlap)) {
        const slice = words.slice(i, i + maxTokens);
        if (!slice.length) break;
        chunks.push(slice.join(" "));
        if (i + maxTokens >= words.length) break;
    }
    return chunks;
}