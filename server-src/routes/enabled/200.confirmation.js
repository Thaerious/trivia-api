import express from "express";
import bodyParser from "body-parser";
import EmailHash from "../../models/EmailHash.js";
import CONST from "../../constants.js";
import handleError from "../../handleError.js";
import Credentials from "../../models/Credentials.js";
import handleResponse from "../../handleResponse.js";
import ParseArgs from "@thaerious/parseargs";

const args = new ParseArgs();

const router = express.Router();
router.use(bodyParser.json());

router.use(`/confirmation/:hash`, async (req, res, next) => {
    console.log(req.params);
    if (confirm(req.params.hash)) {
        console.log("REDIRECT");
        if (args.debug) {
            handleResponse(res);
        } else {
            res.redirect(303, CONST.URL.PORTAL);
        }
        res.end();
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

    if (emailHash) {        

        const user = Credentials.get({ email: emailHash.email });
        console.log(user);
        user.confirmed = 1;
        emailHash.delete();
        return true;
    }
    return false;
}

export { router as default, confirm }