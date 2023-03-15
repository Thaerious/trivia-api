import CONST from "./constants.js";
import logger from "./setupLogger.js";

function handleError(res, url, err, obj = {}) {
    if (typeof url == "object") return _handleError(res, url);

    res.set('Content-Type', 'application/json');
    const msg = JSON.stringify({
        status: CONST.STATUS.EXCEPTION,
        url: url,
        message: err?.message,
        cause: err?.cause,
        ...obj
    }, null, 2);

    logger.log(msg);
    res.status(422);
    res.write(msg);
    res.end();
}

function _handleError(res, options = {}) {
    res.set('Content-Type', 'application/json');
    const msg = JSON.stringify({
        status: CONST.STATUS.EXCEPTION || options.status,
        url: options.url || res.req.originalUrl,
        message: options.message,
        cause: options.cause,
        data: {
            ...options.data
        }
    }, null, 2);

    if (options.log === undefined || options.log === true) logger.log(msg);
    res.status(options.code || 422);
    res.write(msg);
    res.end();
}

export default handleError;