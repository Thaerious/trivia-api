import crypto from "crypto";
import ModelFactory from "@thaerious/sql-model-factory";
import CONST from "../constants.js";
import { Email } from "../EmailFactory.js";

const factory = ModelFactory.instance;
factory.dbFile = CONST.DB.PRODUCTION;

const HASH_LEN = 64;

factory.createClasses({
    EmailHash : {
        "hash": `VARCHAR(${HASH_LEN})`,
        "email": `VARCHAR(64)`,
        "created": "DATE DEFAULT (datetime('now','localtime'))"
    }
});

class EmailHash extends factory.classes.EmailHash {
    constructor(email) {
        const hash = crypto.randomBytes(HASH_LEN / 2).toString("hex");

        const prev = EmailHash.get({ email: email })
        if (prev) {
            prev.hash = hash;
            return prev;
        }
        else {
            return super({ email: email, hash: hash });
        }
    }
}

export default EmailHash;