import Credentials from "../../server-src/Credentials.js";
import CONST from "../../server-src/constants.js";

const credentials = new Credentials(CONST.DB.PRODUCTION).create();
const username = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

await credentials.addUser(username, email, password);
credentials.setConfirmed(username);