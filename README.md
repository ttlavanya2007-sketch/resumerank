# 0 to shipped

A React and Express resume/JD comparison app. The API stores submitted PDFs in
MongoDB GridFS, sends the PDF and job description to Gemini, and saves the
resulting score, matched skills, missing skills, and explanation in MongoDB.

## Requirements

- Node.js 20.19+ or 22.12+
- A MongoDB connection string (local MongoDB or MongoDB Atlas)

## Configure MongoDB

Create `backend/.env` based on `backend/.env.example`, then set `MONGODB_URI`
to your MongoDB connection string and `GEMINI_API_KEY` to your Google AI Studio
API key. Keep `.env` private and out of version control. `GEMINI_MODEL` defaults
to `gemini-flash-latest` and can be changed to another supported model.

## Run locally

From the repository root:

```sh
npm install
npm run dev
```

Vite serves the frontend at `http://localhost:5173` and proxies `/api` requests
to Express at `http://localhost:3001`.

## API

`POST /api/comparisons` accepts `multipart/form-data` with:

- `resume`: PDF file, up to 10 MB
- `jobDescription`: text, 30–10,000 characters

On success it returns a comparison ID, `completed` status, a 0–100 score,
matched skills, missing skills, and a short explanation. Resume bytes are stored
in the `resumes` GridFS bucket; the comparison document is stored in the
`comparisons` collection.

The resume PDF and job description are sent to Google Gemini for analysis using
the `@google/genai` SDK. The API requests structured JSON with the score,
matched and missing skills, and explanation. See Google's
[Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart),
[models](https://ai.google.dev/gemini-api/docs/models), and
[PDF processing](https://ai.google.dev/gemini-api/docs/document-processing)
documentation.

Build the frontend with `npm run build`. Start the backend in production with
`npm start` after configuring `backend/.env`.

## Deploy to Vercel

The root `vercel.json` defines two services in one Vercel project:

- `frontend` serves the Vite app at `/`.
- `backend` serves the Express API at `/api/*`.

The frontend calls `/api/comparisons` on the shared origin. Vercel rewrites that
public path to the backend service, so no internal service binding or browser
hostname is needed. The Vite `localhost:3001` proxy is only for local
development.

Import the repository as a Vercel project with the repository root as the
project root. Add `MONGODB_URI` and `GEMINI_API_KEY` as project environment
variables in Vercel; optionally set `GEMINI_MODEL`. Vercel services share the
project environment, so these server-side variables are available to the
backend. Do not add a binding URL as an environment variable.

Use `npx vercel dev` to exercise the service routing locally. The regular
`npm run dev` remains available for the existing two-process local workflow.
