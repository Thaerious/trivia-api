import express from "express";
import cors from "cors";

const router = express.Router();

const options = {
    credentials: true,
    origin: 'http://192.168.1.217:8000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

router.use(`*`, cors(options));

export default router; 