import CONST from "../constants.js";
import sqlite3 from "better-sqlite3";
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
    async setHash(username, password) {
        if (!password) throw new Error(`undefined password`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        this.hash = await bcrypt.hash(password, CONST.DB.SALT_ITERATIONS);
        return this.hash;
    }

    async validateHash(username, password) {
        if (!this.hasUser(username)) return false;
        return bcrypt.compare(password, this.hash);
    }

    /**
     * True if the username exists, otherwise false.
     */
    static hasUser(username) {
        const sql = `SELECT * FROM ${Credentials.TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const results = stmt.get(username);
        return results !== undefined;
    }

    /**
     * True if the email has alredy been used, otherwise false.
     */
    static hasEmail(email) {
        const sql = `SELECT * FROM ${Credentials.TABLE} WHERE email = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const results = stmt.get(email);
        return results !== undefined;
    }
}

export default function (dbfile, settings = {}) {
    return new ModelFactory(dbfile, settings).createClass(model, Credentials);
}
