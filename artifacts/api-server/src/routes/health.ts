import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get(["/health", "/healthz"], (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.status(200).json({
    ...data,
    service: "api-server",
    timestamp: new Date().toISOString(),
  });
});

export default router;
