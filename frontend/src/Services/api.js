import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, // contoh: http://localhost:8080/api
  withCredentials: false,
});

export const listDocs = async (params = {}) => {
  const res = await api.get("/docs", { params });
  return res.data;
};

export const getDoc = async (id) => {
  const res = await api.get(`/docs/${id}`);
  return res.data;
};

export const deleteDoc = async (id) => {
  const res = await api.delete(`/docs/${id}`);
  return res.data;
};

/** ⬇️ BARU: update dokumen (status, komentar, dsb.) */
export const updateDoc = async (id, patch) => {
  try {
    const res = await api.patch(`/docs/${id}`, patch);
    return res.data;
  } catch (e) {
    // fallback jika server tidak menerima PATCH
    if (e.response?.status === 404 || e.response?.status === 405) {
      const res2 = await api.put(`/docs/${id}`, patch);
      return res2.data;
    }
    throw e;
  }
};

/** (Opsional) kalau approve perlu upload file ke endpoint khusus */
export const approveWithFile = async (id, file) => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post(`/docs/${id}/approve`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
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
  return res.data;
};

export const updateDocStatus = async (id, payload) => {
  const res = await api.patch(`/docs/${id}/status`, payload);
  return res.data; 
};