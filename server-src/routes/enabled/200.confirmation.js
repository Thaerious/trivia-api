import express from "express";
import bodyParser from "body-parser";
import EmailHash from "../../models/EmailHash.js";
import CONST from "../../constants.js";
import handleError from "../../handleError.js";
import Credentials from "../../models/Credentials.js";
import handleResponse from "../../handleResponse.js";

const router = express.Router();
router.use(bodyParser.json());

router.use(`/confirmation/:hash`, async (req, res, next) => {
    console.log(req.params);
    if (confirm(req.params.hash)) {
        res.redirect(CONST.URL.PORTAL);
    } else {
        handleError(res, {
            code: 404,
            url: req.originalUrl,
            message: "Confirmation hash not found."
        });
    }
});

function confirm(hash) {
    if (!hash) throw new Error("Undefined hash value");

    const emailHash = EmailHash.get({ "hash": hash })
    console.log(emailHash);
    if (emailHash) {
        const user = Credentials.get({ email: emailHash.email });
        user.confirmed = 1;
        emailHash.delete();
        return true;
    }
    return false;
}

export { router as default, confirm }