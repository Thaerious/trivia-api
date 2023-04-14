import CONST from "../../constants.js";
import express from "express";
import bodyParser from "body-parser";
import Credentials from "../../models/Credentials.js";
import handleError from "../../handleError.js";
import handleResponse from "../../handleResponse.js";
import DBHash from "../../models/DBHash.js";
import EmailFactory from "../../EmailFactory.js";
import logger from "../../setupLogger.js";

const emailFactory = new EmailFactory();

DBHash.$createTables(CONST.DB.PRODUCTION, { verbose: logger.sql });

class CredentialsHandler {
    async middleware(req, res, next) {
        logger.verbose(`credentials.${req.params.action} : ${JSON.stringify(req.body, null, 2)}`);

        try {
            if (typeof this[req.params.action] === "function") {
                await this[req.params.action](req, res);
            }
        } catch (error) {
            logger.error(error);
            handleError(res, { cause: error });
        } finally {
            res.end();
        }
    }

    status(req, res) {
        handleResponse(res, {
            log: true,
            data: {
                logged_in: isLoggedIn(req)
            }
        });
    }

    /**
     * Register a new user.
     * - Sends and email to the user
     * - Adds the credentials to the user db table.
     * - Adds a hash to the email confirmation table.
     */
    register(req, res) {
        new Credentials(req.body);
        const conf = new DBHash({ hash: req.hash });
        const confirmationURL = CONST.URL.CONFIRMATON + "/" + conf.assignNewHash();
        emailFactory
            .confirmation(req.body.email, confirmationURL)
            .send();
        handleResponse(res);
    }

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
    }

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
    }

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

const router = express.Router();
router.use(bodyParser.json());
const hnd = new CredentialsHandler();
router.use(`/credentials/:action`, (req, res, next)=> hnd.middleware(req, res, next));

export {
    router as default,
    CredentialsHandler,
    isLoggedIn,
    setLoggedIn,
    getUserName
};