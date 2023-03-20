import CONST from "./constants.js";
import logger from "./setupLogger.js";

function handleError(res, options = {}) {
    try {
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
    } catch (err) {
        logger.log(err);
    }
}

export default handleError;