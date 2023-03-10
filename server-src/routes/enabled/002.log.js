import express from "express";
import logger from "../../setupLogger.js";

const router = express.Router();

router.use(`*`, (req, res, next) => {
    const a = [
        new Date().toLocaleTimeString(),
        req.ip,
        req.method,
        req.originalUrl,
        req.get("content-type"),
    ]

    logger.log(a.join(" "));
    next();
});

export default router; 