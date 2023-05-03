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

const args = new ParseArgs();

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
            } else {
                handleResponse(res, {
                    message: `unknown action: ${req.params.action}`,
                    code: 404
                });
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
                logged_in: isLoggedIn(req),
                username: getUserName(req),
                email: getEmail(req)
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
    async register(req, res) {
        const cred = new Credentials(req.body);
        await cred.setPW(req.body.password);
        const conf = new EmailHash(req.body.email);
        const confirmationURL = CONST.URL.CONFIRMATON + "/" + conf.hash;

        emailFactory
            .confirmation(req.body.email, confirmationURL)
            .send();

        handleResponse(res, {
            data: {
                url: args.debug ? confirmationURL : undefined
            }
        });
    },

    /**
     * Log a user into the system.  
     * Body: {username, password}
     * - Responds with rejected or exception if the username is invalid or the password does not match.
     * - Responds with success if the user has been logged in.
     * - Credentials are stored unser req.session.user.
     */
    async login(req, res) {
        const cred = validateCredentials(req, res);
        if (!cred) return;

        setLoggedIn(req, true);
        req.session.user = cred;
        handleResponse(res);
    },

    /**
     * Update a users email.
     * Body: {username, email, password}
     */
    async updateEmail(req, res) {
        const cred = validateCredentials(req, res);
        if (!cred) return;

        cred.email = req.body.email;
        req.session.user = cred;
        handleResponse(res);
    },

    /**
     * Update a users email.
     * Body: {username, email, password}
     */
    async updatePassword(req, res) {
        const cred = validateCredentials(req, res);
        if (!cred) return;

        await cred.setPW(req.body.new_password);
        req.session.user = cred;
        handleResponse(res);
    },

    async deleteUser(req, res) {
        const cred = validateCredentials(req, res);
        if (!cred) return;

        setLoggedIn(req, false);
        delete req.session.user;
        cred.$delete();
        handleResponse(res);
    },    

    logout(req, res) {
        setLoggedIn(req, false);
        delete req.session.user;
        handleResponse(res);
    }
}

function validateCredentials(req, res) {
    const cred = Credentials.get({ username: req.body.username });

    if (!cred) {
        return handleResponse(res, {
            message: "invalid login credentials",
            code: 404
        });
    }

    const validate = cred.validatePW(req.body.password);

    if (!validate) {
        return handleResponse(res, {
            message: "invalid login credentials",
            code: 404
        });
    }    

    return cred;
}

function isLoggedIn(req) {
    return req.session[CONST.SESSION.LOGGED_IN] || false;
}

function setLoggedIn(req, value) {
    req.session[CONST.SESSION.LOGGED_IN] = value;
}

function getUserName(req) {
    return req.session?.user?.username;
}

function getEmail(req) {
    return req.session?.user?.email;
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

handler.validator.addSchema({
    "id": "/deleteUser",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 },
        "password": { "type": "string", minLength: 1, maxLength: 32 },
    },
    "required": ["username", "password"]
});

handler.validator.addSchema({
    "id": "/updateEmail",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 },
        "email": { "type": "string", minLength: 1, maxLength: 32 },
        "password": { "type": "string", minLength: 1, maxLength: 32 },
    },
    "required": ["username", "email", "password"]
});

handler.validator.addSchema({
    "id": "/updatePassword",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 },
        "newPassword": { "type": "string", minLength: 1, maxLength: 32 },
        "password": { "type": "string", minLength: 1, maxLength: 32 },
    },
    "required": ["username", "newPassword", "password"]
});

handler.validator.addSchema({
    "id": "/login",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 },
        "password": { "type": "string", minLength: 1, maxLength: 32 },
    },
    "required": ["username", "password"]
});

handler.validator.addSchema({
    "id": "/logout",
    "type": "object",
    "properties": {},
    "required": []
});

const router = express.Router();
router.use(
    `/credentials/:action`,
    bodyParser.json(),
    (req, res, next) => handler.middleware(req, res, next)
);

export { router as default, isLoggedIn, setLoggedIn, getUserName } 
