# 📄 SIKOMA - Sistem Informasi Komunikasi dan Manajemen Surat 
**Simplify, track, and connect with SIKOMA** 

A smart, centralized platform for document and letter management designed to help student organization and campus administrative units efficiently upload, track and manage their official correspondence. 
SIKOMA ensures document handling, clear tracking statuses, and AI-powered tools for smarter workflows. 

---

## 🚀 **Features** 

### 1. 👤 User Management 
- Register, login, and login via Google OAuth 
- Forgot password and reset password. 
- Update and manage profile information.
- Notification for join organization. 
- Notification to get accepted by the organization. 

### 2. 🗂️ Document Management 
- Upload, views, and search document. 
- Track document approval status (uploaded, in review, approved, or rejected).
- Manage files with role-based access access control (admin, member). 
- Notification if there is a new uploaded document. 

### 3. 🧠 AI Integration (Gemini API)
- **Semantic Search:** Find related documents using natural language queries. 
- **Document Summarization:** Generate concise summaries for long documents. 
- **Speech-to-Text:** Convert voice queries into searchable text. 

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js, Tailwind CSS |
| **Backend** | Node.js / Express, MongoDB (Database) |
| **AI Services** | Gemini API |
| **Authentication** | JWT, Google OAuth |
| **File Storage** | MongoDB GridFS |

---
## 📦 Installation

**Clone the repository**

- git clone https://github.com/CahKangkung/SIKOMA.git
- cd SIKOMA

**Backend setup**
- cd backend
- npm install 
- npm run dev 

**Frontend setup**
- cd frontend 
- npm install 
- npm run dev 

## ⚙️ **Configuration**
> Backend .env file

### Backend server port
- PORT=8080

### Database for documents
- MONGODB_URI=mongodb+srv://<your_mongodb_uri>/documentDB

### Database for users and organizations
- MONGODB_URI_USER=mongodb+srv://<your_mongodb_uri>/userDB

### Gemini API
- GEMINI_API_KEY=<your_gemini_api_key>

### JWT Secret
- JWT_SECRET=dev-secret

### Google OAuth
- GOOGLE_CLIENT_ID=<your_google_client_id>
- GOOGLE_CLIENT_SECRET=<your_google_client_secret>

### Email for password reset
- EMAIL_USER=<your_email>
- EMAIL_PASS=<your_email_app_password>

### Frontend URL for password reset
- CLIENT_URL=http://localhost:5174

--- 

> Frontend .env file

- VITE_API_BASE=http://localhost:8080/api

---

## 🧩 API Documentation 
All backend API endpoints are prefixed with /api/... 
Protected routes require a valid **JWT Bearer Token**. 

## 👤 User Routes 
| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| POST   | /api/auth/register              | Register a new user            |
| POST   | /api/auth/login                 | Login user                     |
| POST   | /api/auth/logout                | Logout user                    |
| GET    | /api/auth/me                    | Get current authenticated user |
| POST   | /api/auth/forgot-password       | Request password reset         |
| POST   | /api/auth/reset-password/:token | Reset user password            |
| PUT    | /api/auth/update                | Update user profile            |
| DELETE | /api/auth/delete                | Delete user account            |
| GET    | /api/auth/google                | Initiate Google OAuth login    |
| GET    | /api/auth/google/callback       | Handle Google OAuth callback   |

## 🗂️ Document Routes 
| Method | Endpoint      | Description                             |
| ------ | ------------- | --------------------------------------- |
| GET    | /api/docs     | Get all organization documents          |
| POST   | /api/docs     | Upload a new document                   |
| GET    | /api/docs/:id | Get specific document details           |
| PUT    | /api/docs/:id | Update document status (approve/reject) |
| DELETE | /api/docs/:id | Delete a document                       |

## 📁 File Routes 
| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| POST   | /api/files/upload    | Upload a file to GridFS   |
| GET    | /api/files/:filename | Download file by filename |
| GET    | /api/files/id/:id    | Download file by ID       |

## 🧠 AI & Ingest Routes 
| Method | Endpoint                      | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| POST   | /api/ingest/summarize-preview | Preview document summary             |
| POST   | /api/ingest/upload            | Upload and analyze document content  |
| POST   | /api/search                   | Search documents by semantic meaning |
| POST   | /api/search/voice             | Search documents using voice input   |

## 🏢 Organization Routes 
| Method | Endpoint                                 | Description                      |
| ------ | ---------------------------------------- | -------------------------------- |
| POST   | /api/organization/create                 | Create new organization          |
| PUT    | /api/organization/:id/edit               | Edit organization attributes     |
| DELETE | /api/organization/:id/delete             | Delete organization              |
| GET    | /api/organization/available              | Get available organizations      |
| GET    | /api/organization/my                     | Get organizations joined by user |
| POST   | /api/organization/:id/join               | Join an organization             |
| POST   | /api/organization/:id/leave              | Leave an organization            |
| GET    | /api/organization/:id/requests           | View pending join requests       |
| POST   | /api/organization/:id/approve/:userId    | Approve join request             |
| POST   | /api/organization/:id/reject/:userId     | Reject join request              |
| GET    | /api/organization/:id/members            | Get member list                  |
| DELETE | /api/organization/:id/members/:memberId  | Remove member                    |
| PUT    | /api/organization/:id/transfer/:memberId | Transfer admin role              |

---

## 🧠 AI-Powered Features 
- Semantic Search: Retrieve relevant documents based on meaning, not just keywords. 
- Document Summarization: Summarize large files using Gemini API. 
- Voice Query: Speak to search - automatic speech-to-text transcription. 

--- 

## 💼 To Run Locally 
> Backend 
- cd backend 
- npm run dev 

> Frontend 
- cd frontend 
- npm run dev 

--- 

## 🔗 Github Repository 
https://github.com/CahKangkung/SIKOMA

## 🌐 Additional Info 

Test Account (for login): 
| Email                                         | Password |
| --------------------------------------------- | -------- |
| [budiman@gmail.com](mailto:budiman@gmail.com) | budiman  |
| [daniel@gmail.com](mailto:daniel@gmail.com)   | daniel   |
| [ronin@gmail.com](mailto:ronin@gmail.com)     | ronin    |
| [root@gmail.com](mailto:root@gmail.com)       | root     |

Deployment: Coming soon 🚀

---

## 👨🏼‍💻 Developers 

| Name                             | Role               |
| -------------------------------- | ------------------ |
| **Abraham Cahyadi Ho**               | Fullstack Engineer |
| **Adhia Dinda Sofia Afifah Masyhur** | Backend Engineer   |
| **Eliyanti**                         | Frontend Engineer  |
| **Rahmat Dipo Setyadin**             | Fullstack Engineer |
| **Tulus Pardamean Simanjuntak**      | Project Planner          |
| **Yosua Siregar**                    | Project Planner          |

--- 

## 📝 Notes 
- All protected routes require a valid Authorization: Bearer <token> header. 
- File uploads are handled via **MongoDB**. 
- The AI modules uses **Gemini API** for summarization, embeddings, and speech recognition. 
- Google OAuth is implemented for secure authentication and user onbarding. 

--- 

### 📍 Simplify, track, and connect with SIKOMA -- your all-in-one smart document management system.