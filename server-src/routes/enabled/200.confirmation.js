import express from "express";
import bodyParser from "body-parser";
import DBHash from "../../models/DBHash.js";
import CONST from "../../constants.js";
import handleError from "../../handleError.js";
import Credentials from "../../models/Credentials.js";
import logger from "../../setupLogger.js";

DBHash.$createTables(CONST.DB.PRODUCTION, { verbose: logger.sql });

const router = express.Router();
router.use(bodyParser.json());

router.use(`/confirmation`, async (req, res, next) => {
    res.redirect(CONST.URL.PORTAL);
});

router.use(`/confirmation/:hash`, async (req, res, next) => {
    if (confirm(req.params.hash)) {
        res.redirect(CONST.URL.PORTAL);
    } else {
        handleError(res, {
            url: req.originalUrl,
            message: "Confirmation hash not found."
        });
    }
});

function confirm(hash) {
    if (!hash) throw new Error("Undefined hash value");

    const dbHash = new DBHash(CONST.DB.PRODUCTION, CONST.DB.TABLE.EMAIL_CONF);
    const validify = dbHash.hasHash(hash);
    if (!validify) return false;
    
    const user = dbHash.getValue(hash);
    new Credentials(CONST.DB.PRODUCTION).setConfirmed(user);
    dbHash.remove(hash);    
    return true;
}

export { router as default, confirm }