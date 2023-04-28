import crypto from "crypto";
import ModelFactory from "@thaerious/sql-model-factory";
import { Email } from "../EmailFactory";

const factory = ModelFactory.instance;
factory.dbFile = CONST.DB.PRODUCTION;

factory.createClasses({
    EmailHash : {
        "hash": "VARCHAR(64)",
        "value": "VARCHAR(64)",
        "created": "DATE DEFAULT (datetime('now','localtime'))"
    }
});

class EmailHash extends factory.classes.EmailHash {
    constructor(value) {
        const hash = crypto.randomBytes(bytes).toString(encoding);

        const prev = EmailHash.get({ value: value })
        if (prev) {
            prev.hash = hash;
            return prev;
        }
        else {
            return super({ value: value, hash: hash });
        }
    }
}

export default EmailHash;