import express, { type Express, type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const simpleRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "POST") return next();

  const windowMs = 60_000;
  const route = req.originalUrl.split("?")[0].replace(/\/+$/, "") || "/";
  const limit = route === "/api/tracking" ? 10 : 30;
  const key = `${req.ip ?? req.socket.remoteAddress ?? "unknown"}:${route}`;
  const now = Date.now();
  const rateState = globalThis as typeof globalThis & {
    __agiRateLimit?: Map<string, { count: number; resetAt: number }>;
    __agiRateLimitSweepCount?: number;
  };
  const current = rateState.__agiRateLimit ?? new Map<string, { count: number; resetAt: number }>();
  rateState.__agiRateLimit = current;
  rateState.__agiRateLimitSweepCount = (rateState.__agiRateLimitSweepCount ?? 0) + 1;

  if (rateState.__agiRateLimitSweepCount % 128 === 0) {
    for (const [entryKey, entry] of current) {
      if (entry.resetAt <= now) current.delete(entryKey);
    }
  }
  while (current.size >= 10_000 && !current.has(key)) {
    const oldestKey = current.keys().next().value;
    if (oldestKey === undefined) break;
    current.delete(oldestKey);
  }

  const previous = current.get(key);
  if (!previous || previous.resetAt <= now) {
    current.set(key, { count: 1, resetAt: now + windowMs });
    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", String(limit - 1));
    res.setHeader("RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));
    return next();
  }

  if (previous.count >= limit) {
    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", "0");
    res.setHeader("RateLimit-Reset", String(Math.ceil(previous.resetAt / 1000)));
    res.setHeader("Retry-After", String(Math.max(1, Math.ceil((previous.resetAt - now) / 1000))));
    return res.status(429).json({ ok: false, message: "Too many requests. Please try again shortly." });
  }

  previous.count += 1;
  res.setHeader("RateLimit-Limit", String(limit));
  res.setHeader("RateLimit-Remaining", String(limit - previous.count));
  res.setHeader("RateLimit-Reset", String(Math.ceil(previous.resetAt / 1000)));
  return next();
};

app.disable("x-powered-by");
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const corsOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:19167,http://localhost:5173").split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "0");
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(["/api/contact", "/api/quotes", "/api/newsletter", "/api/tracking"], simpleRateLimiter);
app.use("/api", router);
app.use("/api", (_req, res) => res.status(404).json({ ok: false, message: "API route not found." }));

const frontendDirectory = path.resolve(import.meta.dirname, "../../atlant-global-india/dist/public");
app.use(express.static(frontendDirectory, { index: false }));
app.get(/.*/, (_req, res, next) => {
  res.sendFile(path.join(frontendDirectory, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
    ? (err as { message: string }).message
    : "Something went wrong on the server.";
  const status = err && typeof err === "object" && "status" in err && typeof (err as { status?: unknown }).status === "number"
    ? (err as { status: number }).status
    : 500;

  logger.error({ err, method: req.method, url: req.originalUrl }, "Unhandled API error");
  res.status(status).json({ ok: false, message: status === 500 ? "Something went wrong on the server." : message });
});

export default app;
