# SAFEHELP AI - Backend

## Overview
SAFEHELP AI Backend is an emergency assistance and accessibility API built with **Node.js**, **Express**, **Supabase PostgreSQL**, and **Google Gemini Multimodal AI**. It follows a strict **MVC (Model-View-Controller)** pattern with enterprise-grade data validation, security, and accessibility provisions.

---

## 🏛️ Architecture (MVC)
```text
React (frontend-to-do)
  ↓
Axios
  ↓
Express Route (src/routes/)
  ↓
Middleware (auth, validation, multer)
  ↓
Controller (src/controllers/)
  ↓
Service (src/services/)
  ↓
Model (src/models/)
  ↓
Supabase PostgreSQL (schema.sql)
```

---

## 📦 Directory Structure
```text
backend-to-do/
│
├── src/
│   ├── config/          # Environment, Supabase client, Gemini API
│   ├── controllers/     # Thin controllers (Request -> Validation -> Service -> Response)
│   ├── models/          # Database access (Supabase & fallback persistence)
│   ├── routes/          # Express route definitions (/api/auth, /api/ai, /api/sos, /api/contacts)
│   ├── services/        # Business logic (Auth, AI, SOS, Contacts)
│   ├── middleware/      # JWT auth, Multer upload, global error handling
│   ├── validators/      # Zod validation schemas
│   └── server.js        # Main Express server initialization
│
├── schema.sql           # Complete Supabase PostgreSQL schema with RLS policies
├── uploads/             # Captured emergency media directory
├── package.json
└── README.md
```

---

## 🔐 Authentication & Security
- **Passwords**: Hashed with `bcryptjs` (salt rounds: 10). Plaintext passwords are never stored or logged.
- **JWT**: Stateless token issuance containing `{ userId, email, name }`. Protected routes verified via `authMiddleware`.
- **Row Level Security (RLS)**: Enforced in `schema.sql` on `users`, `emergency_contacts`, and `sos_events`.

---

## 🤖 AI Layer (Google Gemini)
- **Text & Voice Analysis**: Converts freeform speech/text into structured emergency triage (Severity, Incident Type, Injuries, Hazards, Recommended Actions).
- **Vision & OCR**: Analyzes images captured through the browser camera for hazards, street signs, and environment orientation without inventing information.
- **Resilience**: Features automatic graceful fallback triage parser if API keys are offline or quota-limited.

---

## 🚀 Running the Backend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Or standard start
npm start
```
Default Port: `http://localhost:5000`
Health Check: `http://localhost:5000/api/health`
