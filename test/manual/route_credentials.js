import DB from "../../server-src/DB.js";
import DBHash from "../../server-src/DBHash.js";
import Credentials from "../../server-src/Credentials.js";
import CONST from "../../server-src/constants.js";
import Path from "path";
import assert from "assert";
import { register, login, updateEmail, logout } from "../../server-src/routes/enabled/200.credentials.js";

const TEST_PATH = Path.join("test", "db", "test_credentials.db");

const res = {
    write: function(text){
        console.log("res> " + text);
    },
    set: function (value) {
        console.log("res> set " + value);
    },
    end: function () {
        console.log("res> END");
    }
}

const confirmationHashes = new DBHash(TEST_PATH, CONST.DB.TABLE.EMAIL_CONF).create();
const credentials = new Credentials(TEST_PATH).create();

try {
    await register(credentials, confirmationHashes, {
        originalUrl: "`/credentials/register",
        body: {
            username: "steve mcdougall",
            email: "frar.test@gmail.com",
            password: "supersecret"
        }
    }, res);
} catch (err) { 
    console.log(err);
}

console.log(confirmationHashes.getHash("steve mcdougall"));
assert.ok(confirmationHashes.getHash("steve mcdougall"));