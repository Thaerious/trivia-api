import crypto from "crypto";
import ModelFactory from "@thaerious/sql-model-factory";
import CONST from "../constants.js";
import { Email } from "../EmailFactory.js";

const factory = ModelFactory.instance;
factory.dbFile = CONST.DB.PRODUCTION;

factory.createClasses({
    EmailHash : {
        "hash": "VARCHAR(64)",
        "email": "VARCHAR(64)",
        "created": "DATE DEFAULT (datetime('now','localtime'))"
    }
});

class EmailHash extends factory.classes.EmailHash {
    constructor(email) {
        const hash = crypto.randomBytes(bytes).toString(encoding);

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