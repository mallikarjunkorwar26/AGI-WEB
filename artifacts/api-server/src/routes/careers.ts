import { randomUUID, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { and, desc, eq } from "drizzle-orm";
import { Router, type Request, type RequestHandler } from "express";
import multer from "multer";
import { z } from "zod";
import { assertDatabaseReady, careerApplicationsTable, careersJobsTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router = Router();
const maxResumeBytes = 5 * 1024 * 1024;
const allowedResumeMimeTypes: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxResumeBytes, files: 1 },
  fileFilter(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, Object.hasOwn(allowedResumeMimeTypes, extension));
  },
});

const jobSchema = z.object({
  title: z.string().trim().min(2).max(120),
  department: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(120),
  employmentType: z.enum(["Full-Time", "Part-Time", "Internship"]),
  experienceRequired: z.string().trim().min(1).max(80),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(10).max(6000),
  requiredSkills: z.array(z.string().trim().min(1).max(80)).max(25),
  published: z.boolean(),
  filled: z.boolean(),
}).strict();

const createJobSchema = jobSchema.omit({ published: true, filled: true }).extend({
  published: z.boolean().default(false),
  filled: z.boolean().default(false),
});
const updateJobSchema = jobSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one job field is required.",
});

const applicationSchema = z.object({
  jobId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(25),
  experience: z.string().trim().min(1).max(100),
  coverLetter: z.string().trim().max(5000).optional().default(""),
});

const applicationStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "shortlisted", "rejected", "hired"]),
}).strict();

const requireAdmin: RequestHandler = (req, res, next) => {
  const expectedToken = process.env.CAREERS_ADMIN_TOKEN;
  if (!expectedToken) {
    return res.status(503).json({ ok: false, message: "Careers administration is not configured." });
  }

  const authorization = req.get("authorization") ?? "";
  const suppliedToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const expectedBytes = Buffer.from(expectedToken);
  const suppliedBytes = Buffer.from(suppliedToken);
  if (
    expectedBytes.length === 0 ||
    expectedBytes.length !== suppliedBytes.length ||
    !timingSafeEqual(expectedBytes, suppliedBytes)
  ) {
    return res.status(401).json({ ok: false, message: "A valid administrator token is required." });
  }

  return next();
};

const handleResumeUpload: RequestHandler = (req, res, next) => {
  uploadResume.single("resume")(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      return res.status(status).json({
        ok: false,
        message: status === 413 ? "Resume must be 5 MB or smaller." : "Please upload one PDF, DOC, or DOCX resume.",
      });
    }
    next(error);
  });
};

function databaseUnavailable(res: import("express").Response, error: unknown) {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    return res.status(503).json({ ok: false, message: "Careers data is unavailable until the database is configured." });
  }
  logger.error({ error }, "Careers database request failed");
  return res.status(500).json({ ok: false, message: "Unable to complete the careers request right now." });
}

function validResumeSignature(extension: string, buffer: Buffer) {
  if (extension === ".pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (extension === ".doc") return buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return extension === ".docx" &&
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;
}

router.get("/careers/jobs", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const database = assertDatabaseReady();
    const jobs = await database
      .select({
        id: careersJobsTable.id,
        title: careersJobsTable.title,
        department: careersJobsTable.department,
        location: careersJobsTable.location,
        employmentType: careersJobsTable.employmentType,
        experienceRequired: careersJobsTable.experienceRequired,
        summary: careersJobsTable.summary,
        description: careersJobsTable.description,
        requiredSkills: careersJobsTable.requiredSkills,
        published: careersJobsTable.published,
        filled: careersJobsTable.filled,
        createdAt: careersJobsTable.createdAt,
        updatedAt: careersJobsTable.updatedAt,
      })
      .from(careersJobsTable)
      .where(and(eq(careersJobsTable.published, true), eq(careersJobsTable.filled, false)))
      .orderBy(desc(careersJobsTable.createdAt));
    return res.status(200).json({ ok: true, jobs });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.post("/careers/applications", handleResumeUpload, async (req, res) => {
  const parsed = applicationSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Please provide valid application details.", errors: parsed.error.flatten() });
  }

  const resume = req.file;
  if (!resume) {
    return res.status(400).json({ ok: false, message: "A PDF, DOC, or DOCX resume is required." });
  }

  const extension = path.extname(resume.originalname).toLowerCase();
  if (!validResumeSignature(extension, resume.buffer)) {
    return res.status(400).json({ ok: false, message: "The uploaded file does not match its resume file type." });
  }

  const safeFilename = path.basename(resume.originalname).replace(/[^\w.-]/g, "_").slice(0, 120) || `resume${extension}`;
  try {
    const database = assertDatabaseReady();
    const [job] = await database
      .select({ id: careersJobsTable.id, title: careersJobsTable.title })
      .from(careersJobsTable)
      .where(and(
        eq(careersJobsTable.id, parsed.data.jobId),
        eq(careersJobsTable.published, true),
        eq(careersJobsTable.filled, false),
      ))
      .limit(1);
    if (!job) {
      return res.status(409).json({ ok: false, message: "This position is no longer accepting applications." });
    }

    const [application] = await database
      .insert(careerApplicationsTable)
      .values({
        id: randomUUID(),
        jobId: job.id,
        jobTitle: job.title,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        experience: parsed.data.experience,
        coverLetter: parsed.data.coverLetter || null,
        resumeOriginalName: safeFilename,
        resumeMimeType: allowedResumeMimeTypes[extension],
        resumeData: resume.buffer,
      })
      .returning({ id: careerApplicationsTable.id });
    return res.status(201).json({ ok: true, message: "Your application has been received.", id: application.id });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.get("/admin/careers/jobs", requireAdmin, async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const database = assertDatabaseReady();
    const jobs = await database.select().from(careersJobsTable).orderBy(desc(careersJobsTable.createdAt));
    return res.status(200).json({ ok: true, jobs });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.post("/admin/careers/jobs", requireAdmin, async (req, res) => {
  const parsed = createJobSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Please provide valid job details.", errors: parsed.error.flatten() });
  }

  try {
    const database = assertDatabaseReady();
    const [job] = await database
      .insert(careersJobsTable)
      .values({ ...parsed.data, id: randomUUID() })
      .returning();
    return res.status(201).json({ ok: true, job });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.patch("/admin/careers/jobs/:id", requireAdmin, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  const parsed = updateJobSchema.safeParse(req.body ?? {});
  if (!id.success || !parsed.success) {
    return res.status(400).json({ ok: false, message: "Please provide a valid job ID and at least one valid job field." });
  }

  try {
    const database = assertDatabaseReady();
    const [job] = await database
      .update(careersJobsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(careersJobsTable.id, id.data))
      .returning();
    if (!job) return res.status(404).json({ ok: false, message: "Job opening not found." });
    return res.status(200).json({ ok: true, job });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.delete("/admin/careers/jobs/:id", requireAdmin, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ ok: false, message: "Please provide a valid job ID." });

  try {
    const database = assertDatabaseReady();
    const [job] = await database
      .delete(careersJobsTable)
      .where(eq(careersJobsTable.id, id.data))
      .returning({ id: careersJobsTable.id });
    if (!job) return res.status(404).json({ ok: false, message: "Job opening not found." });
    return res.status(200).json({ ok: true, message: "Job opening deleted." });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.get("/admin/careers/applications", requireAdmin, async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const offset = z.coerce.number().int().min(0).max(1_000_000).safeParse(req.query.offset ?? 0);
  if (!offset.success) return res.status(400).json({ ok: false, message: "Invalid applications page offset." });

  try {
    const database = assertDatabaseReady();
    const pageSize = 100;
    const applications = await database
      .select({
        id: careerApplicationsTable.id,
        jobId: careerApplicationsTable.jobId,
        jobTitle: careerApplicationsTable.jobTitle,
        fullName: careerApplicationsTable.fullName,
        email: careerApplicationsTable.email,
        phone: careerApplicationsTable.phone,
        experience: careerApplicationsTable.experience,
        coverLetter: careerApplicationsTable.coverLetter,
        resumeOriginalName: careerApplicationsTable.resumeOriginalName,
        status: careerApplicationsTable.status,
        createdAt: careerApplicationsTable.createdAt,
      })
      .from(careerApplicationsTable)
      .orderBy(desc(careerApplicationsTable.createdAt))
      .limit(pageSize)
      .offset(offset.data);
    return res.status(200).json({ ok: true, applications, hasMore: applications.length === pageSize });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.patch("/admin/careers/applications/:id", requireAdmin, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  const parsed = applicationStatusSchema.safeParse(req.body ?? {});
  if (!id.success || !parsed.success) {
    return res.status(400).json({ ok: false, message: "Please provide a valid application ID and status." });
  }

  try {
    const database = assertDatabaseReady();
    const [application] = await database
      .update(careerApplicationsTable)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(careerApplicationsTable.id, id.data))
      .returning({ id: careerApplicationsTable.id, status: careerApplicationsTable.status });
    if (!application) return res.status(404).json({ ok: false, message: "Application not found." });
    return res.status(200).json({ ok: true, application });
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

router.get("/admin/careers/applications/:id/resume", requireAdmin, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ ok: false, message: "Please provide a valid application ID." });

  try {
    const database = assertDatabaseReady();
    const [application] = await database
      .select({
        resumeData: careerApplicationsTable.resumeData,
        resumeMimeType: careerApplicationsTable.resumeMimeType,
        resumeOriginalName: careerApplicationsTable.resumeOriginalName,
      })
      .from(careerApplicationsTable)
      .where(eq(careerApplicationsTable.id, id.data))
      .limit(1);
    if (!application) return res.status(404).json({ ok: false, message: "Application or resume not found." });
    res.setHeader("Content-Type", application.resumeMimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${application.resumeOriginalName}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return res.status(200).send(application.resumeData);
  } catch (error) {
    return databaseUnavailable(res, error);
  }
});

export default router;
