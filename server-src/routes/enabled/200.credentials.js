import express from "express";
import bodyParser from "body-parser";
import Credentials from "../../Credentials.js";
import handleError from "../../handleError.js";
import handleResponse from "../../handleResponse.js";
import DBHash from "../../DBHash.js";
import CONST from "../../constants.js";
import EmailFactory from "../../EmailFactory.js";
import logger from "../../setupLogger.js";
import Path from "path";

const emailFactory = new EmailFactory();
new DBHash(CONST.DB.PRODUCTION, CONST.DB.TABLE.EMAIL_CONF).create();
new Credentials(CONST.DB.PRODUCTION).create();

const router = express.Router();
router.use(bodyParser.json());
router.use(`/credentials/:action`, async (req, res, next) => {
    const credentials = new Credentials(CONST.DB.PRODUCTION);
    const confirmationHashes = new DBHash(CONST.DB.PRODUCTION, CONST.DB.TABLE.EMAIL_CONF);

    try {
        logger.verbose(`${req.params.action} : ${JSON.stringify(req.body, null, 2)}`);

        switch (req.params.action) {
            case "register":
                await register(credentials, confirmationHashes, req, res, next);
                break;
            case "login":
                await login(credentials, confirmationHashes, req, res, next);
                break;
            case "update_email":
                await updateEmail(credentials, confirmationHashes, req, res, next);
                break;
            case "logout":
                await logout(credentials, confirmationHashes, req, res, next);
                break;
            default:
                handleError(res, {
                    url: req.originalUrl,
                    message: `unknown action ${req.params?.action}`
                });
                break;
        }
    } catch (error) {
        console.log(error);
        handleError(res, req.originalUrl, error);
    } finally {
        res.end();
    }
});

/**
 * Register a new user.
 * - Sends and email to the user
 * - Adds the credentials to the user db table.
 * - Adds a hash to the email confirmation table.
 */ 
async function register(credentials, confirmationHashes, req, res, next) {
    await credentials.addUser(req.body.username, req.body.email, req.body.password);
    const confirmationURL = createConfirmationURL(req.body.username, confirmationHashes);
    handleResponse(res, req.originalUrl, { status: CONST.STATUS.SUCCESS });
    const email = emailFactory.confirmation(req.body.email, confirmationURL);
    email.send();
}

function createConfirmationURL(username, confirmationHashes) {
    const hash = confirmationHashes.assign(username, 16);
    return Path.join(CONST.URL.CONFIRMATON, hash);
}

/**
 * Log a user into the system.  
 * Responds with rejected or exception if the username is invalid or the password does not match.
 * Responds with success if the user has been logged in.
 * Saves a session hash on success.
 */
async function login(credentials, confirmationHashes, req, res, next) {
    const validate = await credentials.validateHash(req.body.username, req.body.password);
    if (validate) {
        req.session.user = credentials.getUser(req.body.username);
        handleResponse(res, req.originalUrl, { status: CONST.STATUS.SUCCESS });
    } else {
        handleResponse(res, req.originalUrl, { status: CONST.STATUS.REJECTED });
    }
}

async function updateEmail(credentials, confirmationHashes, req, res, next) {
    const validate = await credentials.validateHash(req.body.username, req.body.password);

    if (!req.session.user) {
        handleResponse(res, req.originalUrl, { status: CONST.STATUS.REJECTED });
    }
    else if (validate) {
        credentials.updateUser(req.body.username, req.body.email);
        req.session.user = credentials.getUser(req.body.username);
        handleResponse(res, req.originalUrl, { status: CONST.STATUS.SUCCESS });
    } else {
        handleResponse(res, req.originalUrl, { status: CONST.STATUS.REJECTED });
    }
}

async function logout(credentials, confirmationHashes, req, res, next) {
    if (!req.session.user) {
        handleResponse(res, req.originalUrl, { status: CONST.STATUS.REJECTED });
    } else {
        delete req.session.user;
        handleResponse(res, req.originalUrl, { status: CONST.STATUS.SUCCESS });
    }
}

export { router as default, register, createConfirmationURL, login, updateEmail, logout};