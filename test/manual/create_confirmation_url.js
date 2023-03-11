import DBHash from "../../server-src/DBHash.js";
import CONST from "../../server-src/constants.js";
import { createConfirmationURL } from "../../server-src/routes/enabled/200.credentials.js";

console.log(CONST.DB.PRODUCTION);
const confirmationHashes = new DBHash(CONST.DB.PRODUCTION, CONST.DB.TABLE.EMAIL_CONF).create();
const confirmationURL = await createConfirmationURL("adam", confirmationHashes);
console.log(confirmationURL);
