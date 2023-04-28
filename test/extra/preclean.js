import fs from "fs";
import CONST from "../../server-src/constants.js";
import logger from "../../server-src/setupLogger.js";

if (fs.existsSync(CONST.DB.PRODUCTION)) {
    logger.verbose(`Before: Removing database '${CONST.DB.PRODUCTION}'`);
    fs.rmSync(CONST.DB.PRODUCTION, { recursive: true });
}

export default {};