import React, { useState } from "react";

const fileLimit = 10 * 1024 * 1024;

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  function handleFile(file) {
    setFileError("");
    setSubmitError("");

    if (!file) {
      setSelectedFile(null);
      setAnalysisResult(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      setAnalysisResult(null);
      setFileError("Please choose a PDF file.");
      return;
    }

    if (file.size > fileLimit) {
      setSelectedFile(null);
      setAnalysisResult(null);
      setFileError("This file is over 10 MB. Please choose a smaller PDF.");
      return;
    }

    setSelectedFile(file);
    setAnalysisResult(null);
    setSubmitError("");
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (isSubmitting) return;
    handleFile(event.dataTransfer.files[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || jobDescription.trim().length < 30) return;

    setIsSubmitting(true);
    setSubmitError("");
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("jobDescription", jobDescription.trim());

      const response = await fetch("/api/comparisons", {
        method: "POST",
        body: formData,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "The comparison could not be completed. Please try again.",
        );
      }

      if (
        !result ||
        typeof result !== "object" ||
        result.status !== "completed" ||
        typeof result.id !== "string" ||
        result.id.length === 0 ||
        !Number.isInteger(result.score) ||
        result.score < 0 ||
        result.score > 100 ||
        !Array.isArray(result.matchedSkills) ||
        !Array.isArray(result.missingSkills) ||
        !result.matchedSkills.every(
          (skill) => typeof skill === "string" && skill.trim().length > 0,
        ) ||
        !result.missingSkills.every(
          (skill) => typeof skill === "string" && skill.trim().length > 0,
        ) ||
        typeof result.explanation !== "string" ||
        result.explanation.trim().length === 0
      ) {
        throw new Error("The server returned an invalid analysis. Please try again.");
      }

      setAnalysisResult(result);
      document.querySelector("#results").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } catch (error) {
      setSubmitError(
        error instanceof TypeError
          ? "Could not reach the server. Make sure the backend is running and MongoDB is connected."
          : error.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="0 to shipped home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M6 22.5 13.5 15l5 5L27 11.5" />
              <path d="M20 11.5h7v7" />
            </svg>
          </span>
          <span>
            0 to <strong>shipped</strong>
          </span>
        </a>
        <a className="topbar-link" href="#how-it-works">
          How it works <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR NEXT ROLE, LESS GUESSWORK
            </div>
            <h1 id="hero-title">
              Your resume,
              <br />
              in <span>clear focus.</span>
            </h1>
            <p className="hero-description">
              Get a quick read on how your resume stacks up. See your match
              score, what you’re bringing, and what could be stronger.
            </p>
            <div className="trust-note">
              <span className="lock-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none">
                  <rect x="4.5" y="8.5" width="11" height="8" rx="2" />
                  <path d="M7 8.5V6a3 3 0 0 1 6 0v2.5M10 11.5v2" />
                </svg>
              </span>
              Your resume and job description are sent to Google Gemini for analysis and saved to MongoDB.
            </div>
          </div>

          <form className="analyzer-card" aria-label="Resume analyzer" onSubmit={handleSubmit}>
            <div className="card-heading">
              <div>
                <p className="card-kicker">RESUME CHECK</p>
                <h2>Let’s see where you stand.</h2>
              </div>
              <span className="step-pill">
                <span>01</span> / 01
              </span>
            </div>

            <label
              className={`upload-zone${isDragging ? " is-dragging" : ""}`}
              htmlFor="resume-file"
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsDragging(false);
                }
              }}
              onDrop={handleDrop}
            >
              <input
                id="resume-file"
                type="file"
                accept=".pdf,application/pdf"
                disabled={isSubmitting}
                onChange={(event) => handleFile(event.target.files[0])}
              />
              <span className="upload-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 15V4m0 0L8 8m4-4 4 4" />
                  <path d="M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" />
                </svg>
              </span>
              <span className="upload-title">
                {selectedFile ? selectedFile.name : "Drop your resume here"}
              </span>
              <span className="upload-subtitle">
                {selectedFile ? (
                  "Ready to check"
                ) : (
                  <>
                    or <span>browse files</span> to upload
                  </>
                )}
              </span>
              <span className="file-hint">
                PDF only <span aria-hidden="true">·</span> Max 10 MB
              </span>
            </label>

            <label className="jd-label" htmlFor="job-description">
              <span>JOB DESCRIPTION</span>
              <span className="jd-counter">{jobDescription.length.toLocaleString()} / 10,000</span>
            </label>
            <textarea
              id="job-description"
              className="job-description"
              value={jobDescription}
              disabled={isSubmitting}
              onChange={(event) => {
                setJobDescription(event.target.value.slice(0, 10_000));
                setAnalysisResult(null);
                setSubmitError("");
              }}
              placeholder="Paste the job description you’re targeting..."
              minLength={30}
              maxLength={10_000}
              required
              rows={5}
            />
            <p className="jd-hint">At least 30 characters. Your JD is saved with your resume for future analysis.</p>

            <p className="file-message" role="status" aria-live="polite">
              {fileError}
            </p>
            {submitError && (
              <p className="submit-error" role="alert">
                {submitError}
              </p>
            )}
            <button
              className="analyze-button"
              type="submit"
              disabled={!selectedFile || jobDescription.trim().length < 30 || isSubmitting}
            >
              {isSubmitting ? "Analyzing your resume..." : "Analyze my resume"}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
            <p className="demo-note">
              By submitting, you agree to send your resume and job description to Google Gemini for analysis.
            </p>
          </form>
        </section>

        <section
          className="results-section"
          id="results"
          aria-labelledby="results-title"
          aria-busy={isSubmitting}
        >
          <div className="results-intro">
            <div>
              <p className="section-kicker">
                {analysisResult ? "YOUR RESUME ANALYSIS" : "RESUME AND JOB DESCRIPTION MATCH"}
              </p>
              <h2 id="results-title">
                {analysisResult
                  ? "Here’s your resume match."
                  : isSubmitting
                    ? "Analyzing your resume..."
                    : "Your results will appear here."}
              </h2>
            </div>
            {analysisResult && (
              <span className="analysis-tag">
                <span />
                GEMINI ANALYSIS
              </span>
            )}
          </div>

          {isSubmitting && (
            <div className="analysis-progress" role="status" aria-live="polite">
              <span className="loading-spinner" aria-hidden="true" />
              <span>Comparing your resume with the job description. This may take a moment.</span>
            </div>
          )}

          {analysisResult && (
            <div className="submission-notice" role="status" aria-live="polite">
              <span className="submission-check" aria-hidden="true">✓</span>
              <div>
                <strong>Resume analysis complete</strong>
                <p>
                  Your result is saved with comparison ID{" "}
                  <code>{analysisResult.id}</code>.
                </p>
              </div>
              <span className="pending-badge">COMPLETE</span>
            </div>
          )}

          {analysisResult ? (
          <div className="results-grid">
            <article className="score-card">
              <div className="score-card-top">
                <div>
                  <p className="result-label">RESUME MATCH SCORE</p>
                  <p className="score-context">Compared with your target job description</p>
                </div>
                <span className="sparkle" aria-hidden="true">
                  ✳
                </span>
              </div>
              <div className="score-wrap">
                <div
                  className="score-ring"
                  role="img"
                  style={{ "--score-fill": `${analysisResult.score * 3.6}deg` }}
                  aria-label={`Resume match score: ${analysisResult.score} out of 100`}
                >
                  <div className="score-inner">
                    <span className="score-number">{analysisResult.score}</span>
                    <span className="score-out-of">/ 100</span>
                  </div>
                </div>
                <div className="score-summary">
                  <span className="score-status">
                    <span />
                    {analysisResult.score >= 80
                      ? "STRONG MATCH"
                      : analysisResult.score >= 60
                        ? "GOOD MOMENTUM"
                        : "ROOM TO GROW"}
                  </span>
                  <p>{analysisResult.explanation}</p>
                </div>
              </div>
              <div className="score-footer">
                <span>
                  <span className="footer-dot" /> Skills matched
                </span>
                <strong>
                  {analysisResult.matchedSkills.length} of{" "}
                  {analysisResult.matchedSkills.length + analysisResult.missingSkills.length}
                </strong>
              </div>
            </article>

            <article className="skills-card">
              <div className="skills-heading">
                <div>
                  <p className="result-label">MATCHED TO THE ROLE</p>
                  <h3>Skills you have</h3>
                </div>
                <span className="skill-count present-count">
                  {String(analysisResult.matchedSkills.length).padStart(2, "0")}
                </span>
              </div>
              <p className="skills-description">
                Requirements evidenced in your resume.
              </p>
              <ul className="skill-list present-list">
                {analysisResult.matchedSkills.map((skill) => (
                  <li key={skill}>
                    <span className="skill-check" aria-hidden="true">
                      ✓
                    </span>
                    {skill}
                  </li>
                ))}
                {analysisResult.matchedSkills.length === 0 && (
                  <li className="empty-skill-list">No matching skills identified.</li>
                )}
              </ul>
            </article>

            <article className="skills-card missing-card">
              <div className="skills-heading">
                <div>
                  <p className="result-label">GAPS TO CONSIDER</p>
                  <h3>Skills not found</h3>
                </div>
                <span className="skill-count missing-count">
                  {String(analysisResult.missingSkills.length).padStart(2, "0")}
                </span>
              </div>
              <p className="skills-description">
                Important requirements not evidenced in your resume.
              </p>
              <ul className="skill-list missing-list">
                {analysisResult.missingSkills.map((skill) => (
                  <li key={skill}>
                    <span className="skill-missing" aria-hidden="true">
                      +
                    </span>
                    {skill}
                  </li>
                ))}
                {analysisResult.missingSkills.length === 0 && (
                  <li className="empty-skill-list">No significant skill gaps identified.</li>
                )}
              </ul>
              {analysisResult.missingSkills.length > 0 && (
                <div className="tip-box">
                  <span aria-hidden="true">✳</span>
                  <p>
                    Already have these skills? Make sure they’re easy to spot on
                    your resume.
                  </p>
                </div>
              )}
            </article>
          </div>
          ) : (
            !isSubmitting && (
              <div className="results-placeholder">
                Upload a resume PDF and paste a job description to see your score,
                matched skills, and gaps.
              </div>
            )
          )}
          <p className="results-disclaimer">
            <span aria-hidden="true">ⓘ</span>
            {analysisResult
              ? "AI-generated analysis is a guide, not a hiring decision. Review the results for accuracy."
              : "Results are generated from the resume and job description you submit."}
          </p>
        </section>

        <section className="how-section" id="how-it-works" aria-label="How it works">
          <span className="how-icon" aria-hidden="true">
            ✳
          </span>
          <p>
            <strong>Simple by design.</strong> Upload your PDF, add a job
            description, and get ready for your next step.
          </p>
          <span className="how-steps">
            NO SPREADSHEETS REQUIRED <span>·</span> JUST A CLEAR NEXT STEP
          </span>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          <span>
            0 to <strong>shipped</strong>
          </span>
        </a>
        <span>A small step closer to your next big thing.</span>
      </footer>
    </div>
  );
}

export default App;
