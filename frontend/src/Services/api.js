import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080/api",
  withCredentials: true,
});

// ----------------------
// 📄 Document endpoints
// ----------------------

// get all document
// export const listDocs = async (organizationId) => {
  export const listDocs = async (organizationId, options = {}) => {
  const res = await api.get("/docs", {
    params: { organizationId, ...options }
    // params: { organizationId }
  });
  return res.data;
}

// create new document
export const createDocument = async (data) => {
  const res = await api.post("/docs", data);
  // const res = await api.post("/docs", data, {
  //   headers: {"Content-Type": "application/json"}
  // });
  return res.data;
}

// get single document
export const getDoc = async (id) => {
  const res = await api.get(`/docs/${id}`);
  return res.data;
};

// delete document (sblmnya tdk ada organizationId)
export const deleteDoc = async (id, organizationId) => {
  const res = await api.delete(`/docs/${id}`, {
    params: { organizationId }
  });
  return res.data;
};


// ----------------------
// 📁 File endpoints
// ----------------------

export const approveWithFile = async (id, file) => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post(`/docs/${id}/approve`, fd);
  // const res = await api.post(`/docs/${id}/approve`, fd, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });
  return res.data;
};

export const upload = async (formData) => {
  const res = await api.post("/files/upload", formData);
  // const res = await api.post("/files/upload", formData, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });
  return res.data;
};

// ----------------------
// 🧠 AI / Search endpoints
// ----------------------

export const search = async (payload) => {
  const res = await api.post("/search", payload);
  return res.data;
};

export const summarizePreview = async (formData) => {
  const res = await api.post("/summarize-preview", formData);
  // const res = await api.post("/summarize-preview", formData, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });
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

export const getOrgMembers = async (orgId) => {
  const res = await api.get(`/organization/${orgId}/members`);
  return res.data;
};

export const getOrgStats = async (orgId) => {
  const response = await api.get(`/organization/${orgId}/stats`);
  return response.data;
};

// export const getOrgStats = (orgId) => {
//   api.get(`/organization/${orgId}/stats`).then((r) => r.data);
// };

// post commit 4
/* ======================================================
   👤 USER AUTH API (tersambung ke MongoDB)
   ====================================================== */

// Ambil data user yang sedang login
export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// Update profile user (username, email, password)
export const updateUser = async (data) => {
  const res = await api.put("/auth/update", data);
  return res.data;
};

// Hapus akun user
export const deleteUser = async () => {
  const res = await api.delete("/auth/delete");
  return res.data;
};

// Login user
export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  console.log(res)
  return res.data;
};

// Register user baru
export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// Logout user
export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

// Login pakai Google
export const googleLogin = async () => {
  window.location.href = `${import.meta.env.VITE_API_BASE}/auth/google`;
};

/* ======================================================
   ⚙️ Error Handling (optional)
   ====================================================== */

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⛔ Unauthorized, please login again.");
    }
    return Promise.reject(error);
  }
);

export default api;