# UA Research Archive — Setup & Deployment Guide

## Local Development

### 1. Backend Setup
- Copy `.env.example` to `.env` in `capstone-backend/` and fill in your values (MongoDB, JWT, etc).
- Make sure MongoDB is running locally (default: `mongodb://localhost:27017/ua-research-archive`).
- Install dependencies:
  ```bash
  cd capstone-backend
  npm install
  node server.js
  ```
- The backend should run on http://localhost:4000

### 2. Frontend Setup
- In `capstone-frontend/public/config.js`, ensure:
  ```js
  API_BASE_URL: 'http://localhost:4000',
  ```
- Open `capstone-frontend/public/index.html` or use a static server (e.g. `npx serve public` inside `capstone-frontend`).

### 3. Test Locally
- Visit the frontend in your browser.
- All data should load if the backend and database are running.

## Deployment (Vercel + Render)

### 1. Backend (Render)
- Push `capstone-backend` to a repository.
- Set environment variables in Render dashboard (use `.env.example` as a guide).
- Set `FRONTEND_URL` to your Vercel frontend URL.
- Render will provide a public backend URL (e.g. `https://your-backend.onrender.com`).

### 2. Frontend (Vercel)
- Push `capstone-frontend` to a repository.
- In `public/config.js`, set `API_BASE_URL` to your Render backend URL.
- Set `RECAPTCHA_SITE_KEY` to your production key.

### 3. Final Steps
- Test the deployed site end-to-end.
- Update CORS and environment variables as needed.

---

**Troubleshooting:**
- If data does not show, check browser console and backend logs for errors.
- Ensure all URLs and secrets are set correctly for the environment.
- For file uploads, use a cloud provider (Cloudinary, S3, etc.) in production.

---

For further help, see the code comments or ask your deployment provider’s documentation.
