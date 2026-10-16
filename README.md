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
to `gemini-2.5-flash` and can be changed to another supported model.

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

The resume PDF and job description are sent to Google Gemini for analysis.
Google’s current model list includes Gemini 2.5 Flash; the previously suggested
`gemini-1.5-flash` is not listed as a currently supported model. See the
[Gemini models](https://ai.google.dev/gemini-api/docs/models) and
[PDF processing](https://ai.google.dev/gemini-api/docs/document-processing)
documentation.

Build the frontend with `npm run build`. Start the backend in production with
`npm start` after configuring `backend/.env`.
