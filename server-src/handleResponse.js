import CONST from "./constants.js";
import logger from "./setupLogger.js";
import ParseArgs from "@thaerious/parseargs";

const args = new ParseArgs();

/**
 * Normalize JSON response for successfull requests.
 * 
 * options {
 *    message : message sent to user and logger
 *    code : http status code
 *    data : response data
 *    reqbody : the original request data (debug mode);
 * }
 */
function handleResponse(res, options = {}) {
    res.set('Content-Type', 'application/json');
    
    const msg = {
        message: options.message,
        data: options.data,
        reqbody: args.debug ? res.req.body : undefined
    };

    switch (options.code) {
        case 404: msg.status = CONST.STATUS.REJECTED
            break;
        case 500: msg.status = CONST.STATUS.EXCEPTION
            break;
        default: msg.status = CONST.STATUS.SUCCESS
            break;
    }

    if (options.log === true) logger.log(JSON.stringify(msg, null, 2));
    res.status(options.code || 202);
    res.write(JSON.stringify(msg, null, 2));
    res.end();
}

export default handleResponse;