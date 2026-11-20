import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownToLine, ArrowLeft, BriefcaseBusiness, LogOut, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import type { CareerApplication, CareerApplicationStatus, CareerJob, CareerJobDraft } from "./careers-types";

type JobEditorState = Omit<CareerJobDraft, "requiredSkills"> & { requiredSkillsText: string };
type ApiEnvelope<T> = { ok: boolean; message?: string; jobs?: T; applications?: T; hasMore?: boolean; job?: CareerJob };

const emptyDraft: JobEditorState = {
  title: "",
  department: "",
  location: "",
  employmentType: "Full-Time",
  experienceRequired: "",
  summary: "",
  description: "",
  requiredSkillsText: "",
  published: false,
  filled: false,
};

const applicationStatuses: CareerApplicationStatus[] = ["new", "reviewing", "shortlisted", "rejected", "hired"];

function messageFrom(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  return fallback;
}

async function adminRequest<T>(token: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(messageFrom(payload, `The administrator request failed (HTTP ${response.status}).`));
  }
  if (!payload || typeof payload !== "object" || !("ok" in payload) || payload.ok !== true) {
    throw new Error("The administrator service returned an unexpected response.");
  }
  return payload as T;
}

function editorFromJob(job: CareerJob): JobEditorState {
  return {
    title: job.title,
    department: job.department,
    location: job.location,
    employmentType: job.employmentType,
    experienceRequired: job.experienceRequired,
    summary: job.summary,
    description: job.description,
    requiredSkillsText: job.requiredSkills.join(", "),
    published: job.published,
    filled: job.filled,
  };
}

function editorPayload(draft: JobEditorState): CareerJobDraft {
  return {
    title: draft.title.trim(),
    department: draft.department.trim(),
    location: draft.location.trim(),
    employmentType: draft.employmentType,
    experienceRequired: draft.experienceRequired.trim(),
    summary: draft.summary.trim(),
    description: draft.description.trim(),
    requiredSkills: draft.requiredSkillsText.split(",").map((skill) => skill.trim()).filter(Boolean),
    published: draft.published,
    filled: draft.filled,
  };
}

export function CareersAdminPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [hasMoreApplications, setHasMoreApplications] = useState(false);
  const [draft, setDraft] = useState<JobEditorState>(emptyDraft);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [loadingMoreApplications, setLoadingMoreApplications] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    const previousContent = robots.content;
    robots.content = "noindex,nofollow";
    return () => {
      if (created) robots?.remove();
      else if (robots) robots.content = previousContent;
    };
  }, []);

  const loadAdminData = async (accessToken: string) => {
    const [jobPayload, applicationPayload] = await Promise.all([
      adminRequest<ApiEnvelope<CareerJob[]>>(accessToken, "/api/admin/careers/jobs"),
      adminRequest<ApiEnvelope<CareerApplication[]>>(accessToken, "/api/admin/careers/applications"),
    ]);
    if (!Array.isArray(jobPayload.jobs) || !Array.isArray(applicationPayload.applications)) {
      throw new Error("The careers administration service returned an unexpected response.");
    }
    setJobs(jobPayload.jobs);
    setApplications(applicationPayload.applications);
    setHasMoreApplications(applicationPayload.hasMore === true);
  };

  const connect = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const accessToken = tokenInput.trim();
    if (!accessToken) return;
    setConnecting(true);
    setError("");
    setNotice("");
    try {
      await loadAdminData(accessToken);
      setToken(accessToken);
      setTokenInput("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to connect to careers administration.");
    } finally {
      setConnecting(false);
    }
  };

  const refresh = async () => {
    setError("");
    setNotice("");
    try {
      await loadAdminData(token);
      setNotice("Careers data refreshed.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to refresh careers data.");
    }
  };

  const loadMoreApplications = async () => {
    setLoadingMoreApplications(true);
    setError("");
    try {
      const payload = await adminRequest<ApiEnvelope<CareerApplication[]>>(
        token,
        `/api/admin/careers/applications?offset=${applications.length}`,
      );
      const additionalApplications = payload.applications;
      if (!Array.isArray(additionalApplications)) throw new Error("The careers service returned an unexpected response.");
      setApplications((current) => [...current, ...additionalApplications]);
      setHasMoreApplications(payload.hasMore === true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load more applications.");
    } finally {
      setLoadingMoreApplications(false);
    }
  };

  const beginNewJob = () => {
    setEditingJobId(null);
    setDraft(emptyDraft);
    setError("");
    setNotice("");
  };

  const editJob = (job: CareerJob) => {
    setEditingJobId(job.id);
    setDraft(editorFromJob(job));
    setError("");
    setNotice("");
    document.getElementById("careers-admin-job-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const saveJob = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSavingJob(true);
    const path = editingJobId
      ? `/api/admin/careers/jobs/${editingJobId}`
      : "/api/admin/careers/jobs";
    try {
      await adminRequest(token, path, {
        method: editingJobId ? "PATCH" : "POST",
        body: JSON.stringify(editorPayload(draft)),
      });
      const notice = editingJobId ? "Job opening updated." : "Job opening created.";
      beginNewJob();
      await loadAdminData(token);
      setNotice(notice);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save the job opening.");
    } finally {
      setSavingJob(false);
    }
  };

  const updateJob = async (job: CareerJob, changes: Partial<CareerJobDraft>) => {
    setError("");
    setNotice("");
    try {
      await adminRequest(token, `/api/admin/careers/jobs/${job.id}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      await loadAdminData(token);
      setNotice("Job opening updated.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update the job opening.");
    }
  };

  const deleteJob = async (job: CareerJob) => {
    if (!window.confirm(`Delete "${job.title}"? Existing applications will be retained.`)) return;
    setError("");
    setNotice("");
    try {
      await adminRequest(token, `/api/admin/careers/jobs/${job.id}`, { method: "DELETE" });
      if (editingJobId === job.id) beginNewJob();
      await loadAdminData(token);
      setNotice("Job opening deleted.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete the job opening.");
    }
  };

  const updateApplicationStatus = async (application: CareerApplication, status: CareerApplicationStatus) => {
    setError("");
    try {
      await adminRequest(token, `/api/admin/careers/applications/${application.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status } : item));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update the application.");
    }
  };

  const downloadResume = async (application: CareerApplication) => {
    setError("");
    try {
      const response = await fetch(`/api/admin/careers/applications/${application.id}/resume`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        throw new Error(messageFrom(payload, `Unable to download this resume (HTTP ${response.status}).`));
      }
      const downloadUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = application.resumeOriginalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to download this resume.");
    }
  };

  const disconnect = () => {
    setToken("");
    setJobs([]);
    setApplications([]);
    setHasMoreApplications(false);
    beginNewJob();
    setError("");
    setNotice("");
  };

  return (
    <div className="careers-admin-page">
      <header className="careers-admin-header">
        <div className="container careers-admin-header-inner">
          <a href="/careers" className="careers-admin-back"><ArrowLeft size={16} /> Careers page</a>
          <span><BriefcaseBusiness size={19} /> Careers administration</span>
          {token && <button type="button" className="careers-admin-logout" onClick={disconnect}><LogOut size={15} /> Sign out</button>}
        </div>
      </header>
      <div className="container careers-admin-content">
        {!token ? (
          <section className="careers-admin-login">
            <span className="careers-kicker">Restricted access</span>
            <h1>Careers administration</h1>
            <p>Enter the administrator token configured for this server to manage vacancies and candidate applications.</p>
            {error && <p className="careers-form-error" role="alert">{error}</p>}
            <form onSubmit={connect}>
              <label htmlFor="careers-admin-token">Administrator token</label>
              <input
                id="careers-admin-token"
                type="password"
                autoComplete="current-password"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={connecting}>{connecting ? "Verifying…" : "Continue"}</button>
            </form>
          </section>
        ) : (
          <>
            <div className="careers-admin-title-row">
              <div>
                <span className="careers-kicker">Recruitment dashboard</span>
                <h1>Manage careers</h1>
                <p>Create and publish job openings, update application status, and securely download resumes.</p>
              </div>
              <button type="button" className="btn btn-outline" onClick={() => void refresh()}><RefreshCw size={15} /> Refresh</button>
            </div>
            {error && <p className="careers-form-error" role="alert">{error}</p>}
            {notice && <p className="careers-admin-notice" role="status">{notice}</p>}

            <section className="careers-admin-section" id="careers-admin-job-editor">
              <div className="careers-admin-section-heading">
                <div>
                  <span className="careers-kicker">{editingJobId ? "Edit vacancy" : "Vacancy management"}</span>
                  <h2>{editingJobId ? "Update job opening" : "Add a job opening"}</h2>
                </div>
                {editingJobId && <button type="button" className="btn btn-outline" onClick={beginNewJob}><Plus size={15} /> New opening</button>}
              </div>
              <form className="careers-admin-job-form" onSubmit={saveJob}>
                <label>Job title<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required maxLength={120} /></label>
                <label>Department<input value={draft.department} onChange={(event) => setDraft({ ...draft, department: event.target.value })} required maxLength={100} placeholder="e.g. IT & Technical" /></label>
                <label>Location<input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} required maxLength={120} /></label>
                <label>Employment type
                  <select value={draft.employmentType} onChange={(event) => setDraft({ ...draft, employmentType: event.target.value as CareerJobDraft["employmentType"] })}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </label>
                <label>Experience required<input value={draft.experienceRequired} onChange={(event) => setDraft({ ...draft, experienceRequired: event.target.value })} required maxLength={80} placeholder="e.g. 2–4 years" /></label>
                <label className="careers-admin-field-wide">Short description<textarea value={draft.summary} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} required minLength={10} maxLength={500} rows={3} /></label>
                <label className="careers-admin-field-wide">Role description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required minLength={10} maxLength={6000} rows={5} /></label>
                <label className="careers-admin-field-wide">Required skills <span>Separate skills with commas</span><input value={draft.requiredSkillsText} onChange={(event) => setDraft({ ...draft, requiredSkillsText: event.target.value })} placeholder="Customer service, CRM, communication" /></label>
                <div className="careers-admin-job-flags">
                  <label><input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} /> Published</label>
                  <label><input type="checkbox" checked={draft.filled} onChange={(event) => setDraft({ ...draft, filled: event.target.checked })} /> Position filled</label>
                </div>
                <div className="careers-admin-form-actions">
                  <button type="submit" className="btn btn-primary" disabled={savingJob}><Save size={15} /> {savingJob ? "Saving…" : editingJobId ? "Save changes" : "Create opening"}</button>
                  {editingJobId && <button type="button" className="btn btn-outline" onClick={beginNewJob}>Cancel edit</button>}
                </div>
              </form>
            </section>

            <section className="careers-admin-section">
              <div className="careers-admin-section-heading">
                <div><span className="careers-kicker">Vacancies</span><h2>Job openings <span className="careers-admin-count">{jobs.length}</span></h2></div>
              </div>
              {jobs.length === 0 ? <p className="careers-admin-empty">No job openings yet. Use the form above to add the first vacancy.</p> : (
                <div className="careers-admin-job-list">
                  {jobs.map((job) => (
                    <article className="careers-admin-job" key={job.id}>
                      <div className="careers-admin-job-copy">
                        <div className="careers-admin-job-status">
                          <span className={job.published && !job.filled ? "is-published" : job.filled ? "is-filled" : ""}>{job.filled ? "Filled" : job.published ? "Published" : "Draft"}</span>
                          <span>{job.department}</span>
                        </div>
                        <h3>{job.title}</h3>
                        <p>{job.location} · {job.employmentType} · {job.experienceRequired}</p>
                      </div>
                      <div className="careers-admin-job-actions">
                        <button type="button" className="btn btn-outline" onClick={() => void updateJob(job, { published: !job.published })}>{job.published ? "Unpublish" : "Publish"}</button>
                        <button type="button" className="btn btn-outline" onClick={() => void updateJob(job, { filled: !job.filled })}>{job.filled ? "Reopen" : "Mark filled"}</button>
                        <button type="button" className="btn btn-outline" onClick={() => editJob(job)}>Edit</button>
                        <button type="button" className="careers-admin-delete" aria-label={`Delete ${job.title}`} onClick={() => void deleteJob(job)}><Trash2 size={16} /></button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="careers-admin-section">
              <div className="careers-admin-section-heading">
                <div><span className="careers-kicker">Candidate pipeline</span><h2>Applications <span className="careers-admin-count">{applications.length}</span></h2></div>
              </div>
              {applications.length === 0 ? <p className="careers-admin-empty">New applications will appear here.</p> : (
                <div className="careers-admin-applications">
                  {applications.map((application) => (
                    <article className="careers-admin-application" key={application.id}>
                      <div className="careers-admin-application-heading">
                        <div>
                          <span className="careers-admin-application-role">{application.jobTitle}</span>
                          <h3>{application.fullName}</h3>
                          <p><a href={`mailto:${application.email}`}>{application.email}</a> · <a href={`tel:${application.phone}`}>{application.phone}</a></p>
                        </div>
                        <label className="careers-admin-status">Application status
                          <select value={application.status} onChange={(event) => void updateApplicationStatus(application, event.target.value as CareerApplicationStatus)}>
                            {applicationStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="careers-admin-application-meta">
                        <span>Experience: {application.experience}</span>
                        <span>Received: {new Date(application.createdAt).toLocaleDateString()}</span>
                        <button type="button" className="careers-admin-download" onClick={() => void downloadResume(application)}><ArrowDownToLine size={15} /> Resume</button>
                      </div>
                      {application.coverLetter && <details className="careers-admin-cover-letter"><summary>Read cover letter</summary><p>{application.coverLetter}</p></details>}
                    </article>
                  ))}
                </div>
              )}
              {hasMoreApplications && (
                <button type="button" className="btn btn-outline" onClick={() => void loadMoreApplications()} disabled={loadingMoreApplications}>
                  {loadingMoreApplications ? "Loading…" : "Load more applications"}
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
