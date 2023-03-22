import express from "express";
import bodyParser from "body-parser";
import Credentials from "../../Credentials.js";
import handleError from "../../handleError.js";
import handleResponse from "../../handleResponse.js";
import DBHash from "../../DBHash.js";
import CONST from "../../constants.js";
import EmailFactory from "../../EmailFactory.js";
import logger from "../../setupLogger.js";

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
            case "status":
                await status(credentials, confirmationHashes, req, res, next);
                break
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
                    message: `unknown action ${req.params?.action}`
                });
                break;
        }
    } catch (error) {
        logger.error(error);
        handleError(res, { cause: error });
    } finally {
        res.end();
    }
});


async function status(credentials, confirmationHashes, req, res, next) {
    handleResponse(res, {
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
async function register(credentials, confirmationHashes, req, res, next) {
    await credentials.addUser(req.body.username, req.body.email, req.body.password);
    const confirmationURL = createConfirmationURL(req.body.username, confirmationHashes);
    handleResponse(res);
    const email = emailFactory.confirmation(req.body.email, confirmationURL);
    email.send();
}

function createConfirmationURL(username, confirmationHashes) {
    const hash = confirmationHashes.assign(username, 16);
    return CONST.URL.CONFIRMATON + "/" + hash;
}

/**
 * Log a user into the system.  
 * Responds with rejected or exception if the username is invalid or the password does not match.
 * Responds with success if the user has been logged in.
 * Saves a session hash on success.
 */
async function login(credentials, confirmationHashes, req, res, next) {
    const username = req.body.username;
    const validate = await credentials.validateHash(username, req.body.password);
    if (validate) {
        setLoggedIn(req, true);
        setUserName(req, username);
        logger.log(`user logged in: '${username}'`);
        handleResponse(res);
    } else {
        if (!credentials.hasUser(username)) logger.log(`unknown user: '${username}'`);
        else logger.log(`invalid password for user: '${username}'`);

        handleError(res, {
            message: "invalid login credentials",
            status: CONST.STATUS.REJECTED,
            log: false
        });
    }
}

async function updateEmail(credentials, confirmationHashes, req, res, next) {
    const validate = await credentials.validateHash(req.body.username, req.body.password);

    if (!req.session.user) {
        handleResponse(res, {
            status: CONST.STATUS.REJECTED
        });
    }
    else if (validate) {
        credentials.updateUser(req.body.username, req.body.email);
        req.session.user = credentials.getUser(req.body.username);
        handleResponse(res);
    }
    else {
        handleResponse(res, {
            url: req.originalUrl,
            status: CONST.STATUS.REJECTED
        });
    }
}

async function logout(credentials, confirmationHashes, req, res, next) {
    setLoggedIn(req, false);
    handleResponse(res);
}

function isLoggedIn(req) {
    return req.session[CONST.SESSION.LOGGED_IN];
}

function setLoggedIn(req, value) {
    req.session[CONST.SESSION.LOGGED_IN] = value;
}

function setUserName(req, value) {
    req.session[CONST.SESSION.USERNAME] = value;
}

function getUserName(req) {
    return req.session[CONST.SESSION.USERNAME];
}

export {
    router as default,
    register,
    createConfirmationURL,
    login,
    updateEmail,
    logout,
    isLoggedIn,
    getUserName
};