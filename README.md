# Secure Notes Platform (MVP)

Minimal web app for secure sharing of educational PDF notes between teachers and students with emphasis on a custom PDF viewer, watermarking, and access control.

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Multer, Bcrypt
- Frontend: React (Vite), PDF.js (CDN)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
npm install
# create .env based on .env.example
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the frontend dev server URL (usually http://localhost:5173). The frontend expects backend at http://localhost:4000 by default.

## Environment Variables (backend/.env)
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/secure_notes
JWT_SECRET=please-change-me
UPLOAD_DIR=uploads
CORS_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=20
```

## Initial Admin User
On first run, if no users exist, the backend exposes a bootstrap route:
- POST /api/auth/bootstrap-admin { email, password, name }

Call it once to create the first Admin, then disable/remove it for production.

## Security Notes
- PDFs are served only via authenticated endpoints; no direct file URLs are exposed.
- Custom viewer disables right-click, print, save shortcuts; adds dynamic watermark.
- Absolute prevention of client-side saving/screenshotting is not possible; users can still capture screen images. This app focuses on deterrence and traceability.

## Scripts
Backend:
- npm run dev – start with nodemon
- npm start – production start

Frontend:
- npm run dev – Vite dev server
- npm run build – production build
- npm run preview – preview build

## Folder Structure
See repository tree for details. Key files:
- backend/server.js – Express app
- frontend/src/components/SecurePDFViewer.jsx – PDF.js viewer with watermark and protections

## Testing Checklist
- Verify auth and role-based access
- Teacher upload validations (PDF only)
- Student can view assigned notes only
- Watermark shows student name/email/timestamp
- Attempt print/save shortcuts – should be blocked by UI
- Try direct file URL access – should be impossible; 401/403

## License
MVP for educational use.



