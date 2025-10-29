import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE, 
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
  try {
    const res = await api.put(`/docs/${id}`, payload);

    return res.data;
  } catch (e) {
    if (e.response?.status === 404 || e.response?.status === 405) {
      console.log(e);
    }
    throw e;
  }
};