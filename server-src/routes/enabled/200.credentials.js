import CONST from "../../constants.js";
import express from "express";
import bodyParser from "body-parser";
import Credentials from "../../models/Credentials.js";
import handleError from "../../handleError.js";
import handleResponse from "../../handleResponse.js";
import EmailFactory from "../../EmailFactory.js";
import logger from "../../setupLogger.js";
import jsonschema from "jsonschema";
import EmailHash from "../../models/EmailHash.js";

const emailFactory = new EmailFactory();
const validator = new jsonschema.Validator();

const handler = {
    async middleware(req, res, next) {
        logger.verbose(`credentials.${req.params.action} : ${JSON.stringify(req.body, null, 2)}`);

        try {
            if (typeof this[req.params.action] === "function") {
                const validated = this.validator.validate(req.body, req.params.action);
                if (!validated) return handleError(res);
                await this[req.params.action](req, res);
            }
        } catch (error) {
            logger.error(error);
            handleError(res, { cause: error });
        } finally {
            res.end();
        }
    },

    status(req, res) {
        handleResponse(res, {
            log: true,
            data: {
                logged_in: isLoggedIn(req)
            }
        });
    },

    /**
     * Register a new user.
     * - Sends and email to the user
     * - Adds the credentials to the user db table.
     * - Adds a hash to the email confirmation table.
     */
    register(req, res) {
        const cred = new Credentials(req.body);
        cred.setPW(req.body.password);
        const conf = new EmailHash(req.body.email);
        const confirmationURL = CONST.URL.CONFIRMATON + "/" + conf.hash;

        emailFactory
            .confirmation(req.body.email, confirmationURL)
            .send();

        handleResponse(res);
    },

    /**
     * Log a user into the system.  
     * Responds with rejected or exception if the username is invalid or the password does not match.
     * Responds with success if the user has been logged in.
     * Saves a session hash on success.
     */
    async login(req, res) {
        const username = req.body.username;

        if (!Credentials.$hasUsername(username)) {
            return handleError(res, {
                message: "invalid login credentials",
                status: CONST.STATUS.REJECTED,
                log: false
            });
        }

        const cred = Credentials.$load({ username: username });
        const validate = cred.validatePassword(req.body.password);

        if (validate) {
            setLoggedIn(req, true);
            req.session.user = cred.$data;
            logger.log(`user logged in: '${username}'`);
            handleResponse(res);
        } else {
            handleError(res, {
                message: "invalid login credentials",
                status: CONST.STATUS.REJECTED,
                log: false
            });
        }
    },

    async updateEmail(req, res) {
        Credentials.$load({ username: req.params.username });
        const validate = await cred.validatePassword(req.body.password);

        if (!isLoggedIn(req)) {
            handleResponse(res, { status: CONST.STATUS.REJECTED });
        }
        else if (validate) {
            cred.email = req.body.email;
            req.session.user = cred.$data;
            handleResponse(res);
        }
        else {
            handleResponse(res, { status: CONST.STATUS.REJECTED });
        }
    },

    logout(req, res) {
        setLoggedIn(req, false);
        handleResponse(res);
    }
}

function isLoggedIn(req) {
    return req.session[CONST.SESSION.LOGGED_IN];
}

function setLoggedIn(req, value) {
    req.session[CONST.SESSION.LOGGED_IN] = value;
}

function getUserName(req) {
    return req.session.user.username;
}

// GameStore.validator.addSchema({
//     "id": "/register",
//     "type": "object",
//     "properties": {
//         "username": { "type": "string", minLength: 1, maxLength: 32 },
//         "email": { "type": "string", minLength: 1, maxLength: 32 },
//         "password": { "type": "string", minLength: 1, maxLength: 32 },
//     },
//     "required": ["username", "gamename", "password"]
// });


const router = express.Router();
router.use(
    `/credentials/:action`,
    bodyParser.json(),
    handler.middleware
);

export { router as default, isLoggedIn, setLoggedIn, getUserName } 
