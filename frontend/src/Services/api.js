import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // pastikan ada /api di .env (contoh: http://localhost:8080/api)
  withCredentials: false,
});

export const listDocs = async (params = {}) => {
  const res = await api.get("/docs", { params });
  return res.data; // ← penting
};

export const getDoc = async (id) => {
  const res = await api.get(`/docs/${id}`);
  return res.data;
};

export const deleteDoc = async (id) => {
  const res = await api.delete(`/docs/${id}`);
  return res.data;
};

export const upload = async (formData) => {
  const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const search = async (payload) => {
  const res = await api.post("/search", payload);
  return res.data;
};

export const summarizePreview = async (formData) => {
  const res = await api.post("/summarize-preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log("[listDocs] raw response.data:", res.data); 
  return res.data;
};
