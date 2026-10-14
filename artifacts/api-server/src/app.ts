import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const simpleRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const windowMs = 60_000;
  const limit = 30;
  const key = `${req.ip ?? "unknown"}:${req.path}`;
  const now = Date.now();
  const current = (globalThis as typeof globalThis & { __agiRateLimit?: Map<string, { count: number; resetAt: number }> }).__agiRateLimit ?? new Map();
  (globalThis as typeof globalThis & { __agiRateLimit?: Map<string, { count: number; resetAt: number }> }).__agiRateLimit = current;

  const previous = current.get(key);
  if (!previous || previous.resetAt < now) {
    current.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (previous.count >= limit) {
    return res.status(429).json({ ok: false, message: "Too many requests. Please try again shortly." });
  }

  previous.count += 1;
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
