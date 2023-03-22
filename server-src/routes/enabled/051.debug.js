import express from "express";
import logger from "../../setupLogger.js";

const router = express.Router();

router.use(`*`, (req, res, next) => {
    console.log(req.session);
    next();
});

export default router; 