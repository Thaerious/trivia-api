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
    const msg = JSON.stringify({
        status: CONST.STATUS.SUCCESS || options.status,
        url: options.url || res.req.originalUrl,
        message: options.message,
        data: options.data,
        reqbody: res.req.body    
    }, null, 2);

    if (options.log === true) logger.log(msg);
    res.status(options.code || 200);
    res.write(msg);
    res.end();
}

export default handleResponse;