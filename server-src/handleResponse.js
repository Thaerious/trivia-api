import CONST from "./constants.js";
import logger from "./setupLogger.js";

/**
 * Normalize JSON response for successfull requests.
 * 
 * obj {
 *    msg : message send to user and logger
 *    url : url set in response to notify user
 *    status : default to SUCCESS
 *    code : http status code
 * }
 */
function handleResponse(res, options = {}) {
    res.set('Content-Type', 'application/json');
    
    const msg = {
        url: options.url || res.req.originalUrl,
        message: options.message,
        data: options.data,
        reqbody: res.req.body
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