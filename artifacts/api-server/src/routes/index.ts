import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  contactLeadsTable,
  db,
  newsletterSubscribersTable,
  quoteRequestsTable,
  trackingSearchesTable,
  websiteEnquiriesTable,
} from "@workspace/db";
import { logger } from "../lib/logger";
import healthRouter from "./health";

const router: IRouter = Router();

const memoryStore = {
  contactLeads: [] as Array<Record<string, unknown>>,
  quotes: [] as Array<Record<string, unknown>>,
  newsletter: [] as Array<Record<string, unknown>>,
  tracking: [] as Array<Record<string, unknown>>,
};

const sanitize = (value: unknown) => typeof value === "string" ? value.trim() : "";
const idFor = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function persistRecord(collection: keyof typeof memoryStore, row: Record<string, unknown>) {
  if (db) {
    if (collection === "contactLeads") {
      await db.insert(contactLeadsTable).values(row as any);
      return;
    }

    if (collection === "quotes") {
      await db.insert(quoteRequestsTable).values(row as any);
      return;
    }

    if (collection === "newsletter") {
      await db.insert(newsletterSubscribersTable).values(row as any);
      return;
    }

    if (collection === "tracking") {
      await db.insert(trackingSearchesTable).values(row as any);
      return;
    }
  }

  memoryStore[collection].push({ ...row, createdAt: new Date().toISOString() });
}

router.use(healthRouter);

router.get("/db-health", async (_req, res) => {
  if (!db) {
    return res.status(200).json({ ok: false, status: "unavailable", database: "not-configured", message: "Database is not configured for persistent storage." });
  }

  try {
    await db.execute("SELECT 1");
    return res.status(200).json({ ok: true, status: "ok", database: "connected", message: "Database connection is healthy." });
  } catch (error) {
    logger.error({ error }, "Database health check failed");
    return res.status(503).json({ ok: false, status: "error", database: "disconnected", message: "Database health check failed." });
  }
});

router.post("/contact", async (req, res) => {
  const schema = z.object({
    name: z.string().trim().min(2).max(120),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7).max(25),
    serviceInterest: z.string().trim().max(120).optional().or(z.literal("")),
    subject: z.string().trim().max(120).optional().or(z.literal("")),
    message: z.string().trim().min(10).max(2000),
    source: z.string().trim().max(80).optional().default("website"),
  });

  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Please provide valid contact details.", errors: parsed.error.flatten() });
  }

  const payload = {
    id: idFor("lead"),
    name: parsed.data.name,
    company: sanitize(parsed.data.company) || null,
    email: parsed.data.email,
    phone: parsed.data.phone,
    serviceInterest: sanitize(parsed.data.serviceInterest) || null,
    subject: sanitize(parsed.data.subject) || "General enquiry",
    message: parsed.data.message,
    source: parsed.data.source,
    status: "new",
  };

  try {
    await persistRecord("contactLeads", payload);
    return res.status(201).json({ ok: true, message: "Contact enquiry submitted.", id: payload.id });
  } catch (error) {
    logger.error({ error }, "Contact enquiry submission failed");
    return res.status(500).json({ ok: false, message: "Unable to submit your enquiry right now." });
  }
});

router.post("/quotes", async (req, res) => {
  const schema = z.object({
    customerName: z.string().trim().min(2).max(120),
    company: z.string().trim().max(160).optional().or(z.literal("")),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7).max(25),
    service: z.string().trim().min(2).max(120),
    requirements: z.string().trim().max(3000).optional().or(z.literal("")),
    location: z.string().trim().max(160).optional().or(z.literal("")),
    source: z.string().trim().max(80).optional().default("website"),
  });

  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Please provide valid quote request details.", errors: parsed.error.flatten() });
  }

  const payload = {
    id: idFor("quote"),
    customerName: parsed.data.customerName,
    company: sanitize(parsed.data.company) || null,
    email: parsed.data.email,
    phone: parsed.data.phone,
    service: parsed.data.service,
    requirements: sanitize(parsed.data.requirements) || null,
    location: sanitize(parsed.data.location) || null,
    status: "new",
    source: parsed.data.source,
  };

  try {
    await persistRecord("quotes", payload);
    return res.status(201).json({ ok: true, message: "Quote request submitted.", id: payload.id });
  } catch (error) {
    logger.error({ error }, "Quote request submission failed");
    return res.status(500).json({ ok: false, message: "Unable to submit your quote request right now." });
  }
});

router.post("/newsletter", async (req, res) => {
  const schema = z.object({ email: z.string().trim().email() });
  const parsed = schema.safeParse(req.body ?? {});

  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "A valid email address is required." });
  }

  const payload = {
    id: idFor("newsletter"),
    email: parsed.data.email,
    status: "active",
  };

  try {
    await persistRecord("newsletter", payload);
    return res.status(201).json({ ok: true, message: "You have been subscribed." });
  } catch (error) {
    logger.error({ error }, "Newsletter subscription failed");
    return res.status(500).json({ ok: false, message: "Unable to subscribe right now." });
  }
});

router.post("/tracking", async (req, res) => {
  const schema = z.object({
    trackingNumber: z.string().trim().min(3).max(100),
    source: z.string().trim().max(80).optional().default("website"),
    resultStatus: z.string().trim().max(80).optional().default("In transit"),
    resultSummary: z.string().trim().max(300).optional().or(z.literal("")),
  });

  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "A valid tracking number is required." });
  }

  const payload = {
    id: idFor("tracking"),
    trackingNumber: parsed.data.trackingNumber,
    searchSource: parsed.data.source,
    resultStatus: parsed.data.resultStatus,
    resultSummary: sanitize(parsed.data.resultSummary) || null,
  };

  try {
    await persistRecord("tracking", payload);
    return res.status(200).json({ ok: true, trackingNumber: payload.trackingNumber, status: payload.resultStatus });
  } catch (error) {
    logger.error({ error }, "Tracking search audit log failed");
    return res.status(500).json({ ok: false, message: "Unable to record tracking search." });
  }
});

export default router;
