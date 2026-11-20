import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Handshake,
  Lightbulb,
  MapPin,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { CareerJob } from "./careers-types";
import "./careers.css";

const departmentFilters = [
  "All Departments",
  "IT & Technical",
  "Networking",
  "Sales & Marketing",
  "Administration",
  "Internships",
] as const;

const careerBenefits: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: TrendingUp,
    title: "Grow with purpose",
    description: "Build a career path through meaningful responsibility, feedback and opportunities to take on more.",
  },
  {
    icon: GraduationCap,
    title: "Keep learning",
    description: "Develop practical skills through hands-on work, shared knowledge and support from experienced colleagues.",
  },
  {
    icon: Lightbulb,
    title: "Make ideas useful",
    description: "Help improve the everyday systems, service experiences and processes that keep our network moving.",
  },
  {
    icon: Handshake,
    title: "Work as one team",
    description: "Collaborate across branches and functions with a shared commitment to customers and one another.",
  },
  {
    icon: Rocket,
    title: "Build real-world skills",
    description: "Take on work that connects to real customer needs, business operations and service outcomes.",
  },
  {
    icon: Sparkles,
    title: "Be recognized",
    description: "Bring your strengths to the team, take ownership and make a visible contribution to our work.",
  },
];

const cultureMoments: Array<{ image: string; alt: string; label: string; title: string; copy: string }> = [
  {
    image: "images/Carrers_images/antonio-janeski-CHVTt0aGbx0-unsplash.avif",
    alt: "Colleagues working together in a professional workplace",
    label: "One connected team",
    title: "Every handoff matters.",
    copy: "Our work is built on people coordinating across teams, branches and customer touchpoints.",
  },
  {
    image: "images/Carrers_images/ian-schneider-TamMbr4okv4-unsplash.avif",
    alt: "A modern workplace supporting collaborative work",
    label: "Work that moves",
    title: "See your impact in action.",
    copy: "From customer conversations to operations, the work we do helps businesses and communities stay connected.",
  },
  {
    image: "images/Carrers_images/sasun-bughdaryan-eMPW598T64s-unsplash.avif",
    alt: "Team members sharing ideas and building skills together",
    label: "Learn by doing",
    title: "Build capability every day.",
    copy: "We value curiosity, knowledge sharing and the discipline to keep improving how we serve.",
  },
];

function jobMatchesDepartment(job: CareerJob, filter: (typeof departmentFilters)[number]) {
  if (filter === "All Departments") return true;
  if (filter === "Internships") return job.employmentType === "Internship";
  const department = job.department.toLowerCase();
  if (filter === "IT & Technical") return /\b(it|technical|technology|software|engineering|data)\b/.test(department);
  if (filter === "Networking") return /\b(network|networking|infrastructure|telecom)\b/.test(department);
  if (filter === "Sales & Marketing") return /\b(sales|marketing|business development)\b/.test(department);
  return /\b(administration|admin|human resources|hr|finance|front office|operations)\b/.test(department);
}

function responseMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  return fallback;
}

function isCareerJob(value: unknown): value is CareerJob {
  if (!value || typeof value !== "object") return false;
  const job = value as Record<string, unknown>;
  return (
    typeof job.id === "string" &&
    typeof job.title === "string" &&
    typeof job.department === "string" &&
    typeof job.location === "string" &&
    typeof job.employmentType === "string" &&
    typeof job.experienceRequired === "string" &&
    typeof job.summary === "string" &&
    typeof job.description === "string" &&
    Array.isArray(job.requiredSkills) &&
    job.requiredSkills.every((skill) => typeof skill === "string") &&
    typeof job.published === "boolean" &&
    typeof job.filled === "boolean" &&
    typeof job.createdAt === "string" &&
    typeof job.updatedAt === "string"
  );
}

export function CareersPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<(typeof departmentFilters)[number]>("All Departments");
  const [search, setSearch] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<CareerJob | null>(null);
  const [applicationError, setApplicationError] = useState("");
  const [applicationSubmitting, setApplicationSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const applicationDialog = useRef<HTMLDialogElement>(null);

  const loadJobs = async (showLoading = true) => {
    if (showLoading) setLoadingJobs(true);
    setJobsError("");
    try {
      const response = await fetch("/api/careers/jobs", { cache: "no-store" });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseMessage(payload, `Unable to load current job openings (HTTP ${response.status}).`));
      }
      if (!payload || typeof payload !== "object" || !("jobs" in payload) || !Array.isArray(payload.jobs) || !payload.jobs.every(isCareerJob)) {
        throw new Error("The careers service returned an unexpected response.");
      }
      setJobs(payload.jobs);
    } catch (error) {
      setJobsError(error instanceof Error ? error.message : "Unable to load current job openings.");
    } finally {
      if (showLoading) setLoadingJobs(false);
    }
  };

  useEffect(() => {
    void loadJobs();
    const refreshJobs = () => { void loadJobs(false); };
    const refreshInterval = window.setInterval(refreshJobs, 30_000);
    window.addEventListener("focus", refreshJobs);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshJobs);
    };
  }, []);

  useEffect(() => {
    if (activeJob) {
      if (!applicationDialog.current?.open) applicationDialog.current?.showModal();
      return;
    }
    if (applicationDialog.current?.open) applicationDialog.current.close();
  }, [activeJob]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesDepartment = jobMatchesDepartment(job, departmentFilter);
      const searchableText = [
        job.title,
        job.department,
        job.location,
        job.experienceRequired,
        job.summary,
        job.description,
        job.requiredSkills.join(" "),
      ].join(" ").toLowerCase();
      return matchesDepartment && (!query || searchableText.includes(query));
    });
  }, [jobs, departmentFilter, search]);

  const startApplication = (job: CareerJob) => {
    setApplicationError("");
    setApplicationSubmitted(false);
    setActiveJob(job);
  };

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeJob) return;
    setApplicationError("");
    setApplicationSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("jobId", activeJob.id);
      const response = await fetch("/api/careers/applications", { method: "POST", body: formData });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(responseMessage(payload, `Unable to submit your application (HTTP ${response.status}).`));
      }
      if (!payload || typeof payload !== "object" || !("ok" in payload) || payload.ok !== true) {
        throw new Error("The application service returned an unexpected response.");
      }
      setApplicationSubmitted(true);
    } catch (error) {
      setApplicationError(error instanceof Error ? error.message : "Unable to submit your application.");
    } finally {
      setApplicationSubmitting(false);
    }
  };

  const closeApplication = () => {
    setActiveJob(null);
    setApplicationError("");
    setApplicationSubmitted(false);
  };

  return (
    <div className="careers-page">
      <section className="careers-hero">
        <div className="careers-hero-backdrop" aria-hidden="true" />
        <div className="container careers-hero-layout">
          <div className="careers-hero-copy">
            <span className="careers-eyebrow"><span /> Careers at Atlant Global India</span>
            <h1>Build your future<br /><em>with us.</em></h1>
            <p className="careers-hero-intro">
              Join the people connecting businesses and communities through dependable courier, cargo and warehousing services.
            </p>
            <div className="careers-hero-actions">
              <a className="btn btn-primary" href="#job-openings">Explore Career Opportunities <ArrowRight size={16} /></a>
              <a className="careers-text-link" href="#our-culture">Discover our culture <ArrowUpRight size={15} /></a>
            </div>
            <div className="careers-hero-values" aria-label="Our purpose">
              <span><CheckCircle2 size={15} /> People-first service</span>
              <span><CheckCircle2 size={15} /> Progress through teamwork</span>
            </div>
          </div>
          <div className="careers-hero-visual">
            <img
              src={`${import.meta.env.BASE_URL}images/Carrers_images/campaign-creators-gMsnXqILjp4-unsplash.avif`}
              alt="Colleagues collaborating in a professional workplace"
            />
            <div className="careers-hero-image-shade" />
            <div className="careers-hero-photo-caption">
              <span className="careers-photo-mark"><BriefcaseBusiness size={19} /></span>
              <span><strong>One network. Many possibilities.</strong><small>Make your next move count.</small></span>
            </div>
            <div className="careers-hero-image-note">People make the difference.</div>
          </div>
        </div>
      </section>

      <section className="careers-purpose section" aria-labelledby="careers-purpose-title">
        <div className="container careers-purpose-grid">
          <div className="careers-section-intro">
            <span className="careers-kicker">Our purpose</span>
            <h2 id="careers-purpose-title">Moving more than parcels.<br /><span>Moving possibilities.</span></h2>
            <p>
              We bring local knowledge and a wider delivery network together to help customers move what matters. Our people make that promise real every day.
            </p>
          </div>
          <div className="careers-purpose-cards">
            <article className="careers-purpose-card">
              <span className="careers-card-index">01</span>
              <h3>Our vision</h3>
              <p>Keep businesses and communities connected through a dependable, evolving logistics network.</p>
            </article>
            <article className="careers-purpose-card">
              <span className="careers-card-index">02</span>
              <h3>Our mission</h3>
              <p>Deliver thoughtful service with care, accountability and a commitment to doing the everyday work well.</p>
            </article>
            <article className="careers-purpose-card careers-purpose-card-wide">
              <span className="careers-card-index">03</span>
              <h3>How we innovate</h3>
              <p>Stay curious, share ideas and improve the ways we coordinate, communicate and serve our customers.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="careers-benefits section" aria-labelledby="careers-benefits-title">
        <div className="container">
          <div className="careers-heading-block">
            <span className="careers-kicker">Why work with us</span>
            <h2 id="careers-benefits-title">A place to learn, contribute<br />and keep moving forward.</h2>
            <p>Bring your perspective. Build your capability. Find meaningful ways to make an impact.</p>
          </div>
          <div className="careers-benefit-grid">
            {careerBenefits.map(({ icon: Icon, title, description }, index) => (
              <article className="careers-benefit-card" key={title}>
                <span className="careers-benefit-icon"><Icon size={20} aria-hidden="true" /></span>
                <span className="careers-benefit-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="our-culture" className="careers-culture section" aria-labelledby="careers-culture-title">
        <div className="container">
          <div className="careers-culture-heading">
            <div>
              <span className="careers-kicker">Our work culture</span>
              <h2 id="careers-culture-title">Good work happens<br />when we move together.</h2>
            </div>
            <p>We bring people, knowledge and ideas together in a professional environment shaped by shared responsibility and continuous learning.</p>
          </div>
          <div className="careers-culture-grid">
            {cultureMoments.map((moment, index) => (
              <article className={`careers-culture-card careers-culture-card-${index + 1}`} key={moment.title}>
                <img
                  src={`${import.meta.env.BASE_URL}${moment.image}`}
                  alt={moment.alt}
                  loading="lazy"
                  decoding="async"
                />
                <div className="careers-culture-card-shade" />
                <div className="careers-culture-copy">
                  <span>{moment.label}</span>
                  <h3>{moment.title}</h3>
                  <p>{moment.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="job-openings" className="careers-openings section" aria-labelledby="careers-openings-title">
        <div className="container">
          <div className="careers-openings-heading">
            <div>
              <span className="careers-kicker">Your next chapter</span>
              <h2 id="careers-openings-title">Explore Our Open Positions</h2>
              <p>Find a role that matches your strengths and where you want to go next.</p>
            </div>
            <span className="careers-openings-count"><BriefcaseBusiness size={16} /> {jobs.length} {jobs.length === 1 ? "open role" : "open roles"}</span>
          </div>

          <div className="careers-job-controls">
            <div className="careers-filter-tabs" role="group" aria-label="Filter jobs by department">
              {departmentFilters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  className={departmentFilter === filter ? "active" : ""}
                  aria-pressed={departmentFilter === filter}
                  onClick={() => setDepartmentFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <label className="careers-job-search">
              <span className="sr-only">Search jobs</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles or skills" />
              <span aria-hidden="true"><ArrowRight size={16} /></span>
            </label>
          </div>

          {loadingJobs ? (
            <div className="careers-jobs-status" role="status">Loading current opportunities…</div>
          ) : jobsError ? (
            <div className="careers-jobs-status careers-jobs-error" role="alert">
              <h3>We couldn’t load current openings.</h3>
              <p>{jobsError}</p>
              <button type="button" className="btn btn-outline" onClick={() => void loadJobs()}>Try again</button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="careers-jobs-status careers-no-openings" role="status">
              <span className="careers-no-openings-icon"><BriefcaseBusiness size={23} /></span>
              <h3>There are no open positions right now.</h3>
              <p>We currently don't have any open positions, but we're always interested in connecting with talented individuals. Stay connected for future opportunities.</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="careers-jobs-status" role="status">
              <h3>No matching opportunities</h3>
              <p>Try another department or keyword.</p>
              <button type="button" className="btn btn-outline" onClick={() => { setDepartmentFilter("All Departments"); setSearch(""); }}>Clear filters</button>
            </div>
          ) : (
            <div className="careers-jobs-grid">
              {filteredJobs.map((job) => {
                const expanded = expandedJobId === job.id;
                return (
                  <article className="careers-job-card" key={job.id}>
                    <div className="careers-job-card-top">
                      <span className="careers-job-department">{job.department}</span>
                      <span className="careers-job-type">{job.employmentType}</span>
                    </div>
                    <h3>{job.title}</h3>
                    <p className="careers-job-summary">{job.summary}</p>
                    <div className="careers-job-meta">
                      <span><MapPin size={15} />{job.location}</span>
                      <span><Clock3 size={15} />{job.experienceRequired}</span>
                    </div>
                    {job.requiredSkills.length > 0 && (
                      <div className="careers-skill-list" aria-label="Required skills">
                        {job.requiredSkills.slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}
                        {job.requiredSkills.length > 5 && <span>+{job.requiredSkills.length - 5}</span>}
                      </div>
                    )}
                    {expanded && (
                      <div className="careers-job-details">
                        <h4>Role overview</h4>
                        <p>{job.description}</p>
                        {job.requiredSkills.length > 0 && (
                          <>
                            <h4>What you’ll bring</h4>
                            <ul>{job.requiredSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                          </>
                        )}
                      </div>
                    )}
                    <div className="careers-job-actions">
                      <button
                        type="button"
                        className="careers-view-details"
                        aria-expanded={expanded}
                        onClick={() => setExpandedJobId(expanded ? null : job.id)}
                      >
                        {expanded ? "Hide Details" : "View Details"} <ArrowUpRight size={15} />
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => startApplication(job)}>
                        Apply Now <ArrowRight size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="careers-final-cta section">
        <div className="container careers-final-cta-inner">
          <div className="careers-final-cta-mark"><Users size={24} /></div>
          <div>
            <span className="careers-kicker">Make your next move</span>
            <h2>Your Next Opportunity Starts Here.</h2>
            <p>Join our team, explore new possibilities, and build a rewarding career with us.</p>
          </div>
          <a className="btn btn-primary" href="#job-openings">Explore Open Positions <ArrowRight size={16} /></a>
        </div>
      </section>

      <dialog
        ref={applicationDialog}
        className="careers-application-dialog"
        aria-labelledby="career-application-title"
        onClose={closeApplication}
        onClick={(event) => {
          if (event.target === applicationDialog.current) applicationDialog.current?.close();
        }}
      >
        {activeJob && (
          <div className="careers-application-content">
            <button type="button" className="careers-dialog-close" aria-label="Close application" onClick={() => applicationDialog.current?.close()}>×</button>
            {applicationSubmitted ? (
              <div className="careers-application-success" role="status">
                <span><CheckCircle2 size={30} /></span>
                <span className="careers-kicker">Application received</span>
                <h2 id="career-application-title">Thank you for applying.</h2>
                <p>Your application for <strong>{activeJob.title}</strong> has been securely submitted to our recruitment team.</p>
                <button type="button" className="btn btn-primary" onClick={() => applicationDialog.current?.close()}>Done</button>
              </div>
            ) : (
              <>
                <span className="careers-kicker">Apply for this role</span>
                <h2 id="career-application-title">{activeJob.title}</h2>
                <p className="careers-application-subtitle">{activeJob.department} · {activeJob.location}</p>
                {applicationError && <p className="careers-form-error" role="alert">{applicationError}</p>}
                <form className="careers-application-form" onSubmit={submitApplication}>
                  <label>
                    Position Applying For
                    <input value={activeJob.title} readOnly aria-readonly="true" />
                  </label>
                  <label>
                    Full Name
                    <input name="fullName" autoComplete="name" required maxLength={120} />
                  </label>
                  <div className="careers-form-row">
                    <label>
                      Email Address
                      <input name="email" type="email" autoComplete="email" required maxLength={254} />
                    </label>
                    <label>
                      Phone Number
                      <input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={25} />
                    </label>
                  </div>
                  <label>
                    Total Experience
                    <input name="experience" placeholder="e.g. 3 years" required maxLength={100} />
                  </label>
                  <label className="careers-resume-upload">
                    Resume <span>PDF, DOC or DOCX · up to 5 MB</span>
                    <input name="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
                  </label>
                  <label>
                    Cover Letter <span className="careers-optional">(optional)</span>
                    <textarea name="coverLetter" rows={4} maxLength={5000} placeholder="Tell us what makes this opportunity right for you." />
                  </label>
                  <p className="careers-privacy-note">Your details and resume will be available only to authorized recruitment administrators.</p>
                  <button type="submit" className="btn btn-primary" disabled={applicationSubmitting}>
                    {applicationSubmitting ? "Submitting…" : "Submit Application"} <ArrowRight size={15} />
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
