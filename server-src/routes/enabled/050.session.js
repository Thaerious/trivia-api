import Express from "express";
import sessions from "express-session";
import dotenv from "dotenv";
import sqlite3 from "better-sqlite3";
import store from "better-sqlite3-session-store";
import logger from "../../setupLogger.js";

dotenv.config();

const router = Express.Router();
const ONE_DAY = 1000 * 60 * 60 * 24;
const MINUTES_15 = 1000 * 60 * 15;
const db = new sqlite3("db/sessions.db", { verbose: logger.sql });

const SqliteStore = store(sessions);

router.use("*", sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: ONE_DAY},
    resave: false,
    store: new SqliteStore({
        client: db,
        expired: {
            clear: true,
            intervalMs: MINUTES_15
        }
    })
}));

export default router;
