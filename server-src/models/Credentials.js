import CONST from "../constants.js";
import bcrypt from "bcryptjs";
import ModelFactory from "@thaerious/sql-model-factory";

const factory = ModelFactory.instance;
factory.dbFile = CONST.DB.PRODUCTION;

factory.createClasses({
    Credentials: {
        'username': 'VARCHAR(32) UNIQUE NOT NULL',
        'email': 'VARCHAR(32) UNIQUE',
        'hash': 'VARCHAR(64)',
        'confirmed': "INTEGER DEFAULT 0"
    }
});

export default class Credentials extends factory.classes.Credentials {
    constructor(username, email, password) {
        let fields = { username: username, email: email };
        if (typeof username === "object") {
            fields = username;
        }
        super(fields);
    }

    /**
     * Assign a hash value to the player based on the 'password' argument.
     */
    async setPW(password) {
        this.hash = await bcrypt.hash(password, CONST.DB.SALT_ITERATIONS);
        return this.hash;
    }

    validatePW(password) {
        return bcrypt.compare(password, this.hash);
    }
}