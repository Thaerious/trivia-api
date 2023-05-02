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
import ParseArgs from "@thaerious/parseargs";

const args = new ParseArgs().run();

/**
 * Router to handle registration and login.
 */

const emailFactory = new EmailFactory();

const handler = {
    validator: new jsonschema.Validator(),
    
    async middleware(req, res, next) {
        logger.verbose(`credentials.${req.params.action} : ${JSON.stringify(req.body, null, 2)}`);

        try {
            if (typeof this[req.params.action] === "function") {
                const validated = this.validator.validate(req.body, { '$ref': req.params.action });
                if (!validated) return handleError(res);
                await this[req.params.action](req, res);
            }
        } catch (error) {
            logger.error(error);
            logger.verbose(error.stack);
            handleError(res, { cause: error });
        } finally {
            res.end();
        }
    },

    /**
     * Use to determine if a specified user is logged in
     * Body: {username}
     * - Checks session store for CONST.SESSION.LOGGED_IN value
     */
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
     * Body: {username, email, password}
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
     * Body: {username, password}
     * - Responds with rejected or exception if the username is invalid or the password does not match.
     * - Responds with success if the user has been logged in.
     * - Credentials are stored unser req.session.user.
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

        const cred = Credentials.get({ username: username });
        const validate = cred.validatePassword(req.body.password);

        if (validate) {
            setLoggedIn(req, true);
            req.session.user = cred;
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

    /**
     * Update a users email.
     * Body: {username, email, password}
     */
    async updateEmail(req, res) {
        Credentials.get({ username: req.params.username });
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
    return req.session[CONST.SESSION.LOGGED_IN] || false;
}

function setLoggedIn(req, value) {
    req.session[CONST.SESSION.LOGGED_IN] = value;
}

function getUserName(req) {
    return req.session.user.username;
}

handler.validator.addSchema({
    "id": "/status",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 },
    },
    "required": ["username"]
});

handler.validator.addSchema({
    "id": "/register",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 },
        "email": { "type": "string", minLength: 1, maxLength: 32 },
        "password": { "type": "string", minLength: 1, maxLength: 32 },
    },
    "required": ["username", "email", "password"]
});

const router = express.Router();
router.use(
    `/credentials/:action`,
    bodyParser.json(),
    (req, res, next) => handler.middleware(req, res, next)
);

export { router as default, isLoggedIn, setLoggedIn, getUserName } 
