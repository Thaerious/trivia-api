import express from "express";
import bodyParser from "body-parser";
import DBHash from "../../DBHash.js";
import DB from "../../DB.js";
import CONST from "../../constants.js";
import handleError from "../../handleError.js";

new DBHash(CONST.DB.PRODUCTION).init();
const router = express.Router();

router.use(bodyParser.json());

router.use(`/confirmation/:hash`, async (req, res, next) => {
    const validify = new DBHash(CONST.DB.PRODUCTION).hasHash(req.params.hash);
    console.log(`hash ${req.params.hash} is value ${validify}`);
    if (!validify) {
        handleError(res, {
            url: req.originalUrl,
            message: "Confirmation hash not found."
        });
    } else {
        // forward user to home page
    }
});

export default router;