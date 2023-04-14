import CONST from "../constants.js";
import bcrypt from "bcryptjs";
import ModelFactory from "@thaerious/sql-model-factory";

const model = {
    "username": "VARCHAR(32) UNIQUE",
    "email": "VARCHAR(64) UNIQUE",
    "hash": "VARCHAR(64)",
    "confirmed": "INTEGER DEFAULT 0"
}

class Credentials {
    /**
     * Assign a password-hash to the player based on the argument 'password'.
     */
    async setPassword(password = "") {
        this.hash = await bcrypt.hash(password, CONST.DB.SALT_ITERATIONS);
        return this.hash;
    }

    /**
     * Determine if password matches the previously set password
     */
    async validatePassword(password) {
        return bcrypt.compare(password, this.hash);
    }
}

export default new ModelFactory().createClass(model, Credentials);
