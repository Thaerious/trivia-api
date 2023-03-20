import CONST from "./constants.js";
import sqlite3 from "better-sqlite3";
import bcrypt from "bcryptjs";


class Credentials {
    static TABLE = "credentials";

    constructor(dbFile) {
        this.dbFile = dbFile;
        this.sqlOptions = {};
    }

    create() {
        new sqlite3(this.dbFile, this.sqlOptions).prepare(`
            CREATE TABLE IF NOT EXISTS ${Credentials.TABLE} ( \
                username VARCHAR(32) primary key, \
                email VARCHAR(64), \
                hash VARCHAR(64), 
                confirmed INTEGER DEFAULT 0
            )`)
            .run();
        return this;
    }

    isConfirmed(username) {
        if (!username) throw new Error(`undefined username`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const sql = `SELECT * FROM ${Credentials.TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const row = stmt.get(username);
        return row.confirmed !== 0;
    }

    setConfirmed(username) {
        if (!username) throw new Error(`undefined username`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const sql = `UPDATE ${Credentials.TABLE} SET confirmed = 1 WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        stmt.run(username);
    }

    /**
     * Add a new user if does not already exist.
     * Throws an exception if the user already exists.
     * Returns a User object.
     */
    async addUser(username, email, password) {
        if (!username) throw new Error(`undefined username`);
        if (!email) throw new Error(`undefined email`);
        if (!password) throw new Error(`undefined password`);
        if (this.hasUser(username)) throw new Error(`user already added: ${username}`);
        if (this.hasEmail(email)) throw new Error(`email already in use: ${email}`);

        const sql = `INSERT INTO ${Credentials.TABLE} (username, email) VALUES (?, ?)`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        stmt.run(username, email);
        await this.setHash(username, password);

        return this.getUser(username);
    }

    /**
     * Assign a hash value to the player based on the argument 'password'.
     */
    async setHash(username, password) {
        if (!username) throw new Error(`undefined username`);
        if (!password) throw new Error(`undefined password`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const hash = await bcrypt.hash(password, CONST.DB.SALT_ITERATIONS);
        const sql = `UPDATE ${Credentials.TABLE} SET hash = ? WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        stmt.run(hash, username);

        return hash;
    }

    getHash(username) {
        if (!username) throw new Error(`undefined username`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const sql = `SELECT * FROM ${Credentials.TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const row = stmt.get(username);
        return row.hash;
    }

    async validateHash(username, password) {
        if (!this.hasUser(username)) return false;

        const sql = `SELECT * FROM ${Credentials.TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const row = stmt.get(username); 

        return bcrypt.compare(password, row.hash);
    }

    /**
     * Change the email for a user.
     * Throws an exception if the user does not exist.
     * No return value.
     */
    updateUser(username, email) {
        if (!this.hasUser(username)) throw new Error(`user not added: '${username}'`);
        const sql = `UPDATE ${Credentials.TABLE} SET email = ? WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        stmt.run(email, username);
        return this.getUser(username);
    }

    /**
     * Retrieve a user if it exists.
     * Throws an exception if the user does not exist.
     * Returns a User object.
     */
    getUser(username) {
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);
        const sql = `SELECT * FROM ${Credentials.TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const results = stmt.get(username);
        return results;
    }

    /**
     * True if the username exists, otherwise false.
     */
    hasUser(username) {
        const sql = `SELECT * FROM ${Credentials.TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const results = stmt.get(username);
        return results !== undefined;
    }

    /**
     * True if the email has alredy been used, otherwise false.
     */
    hasEmail(email) {
        const sql = `SELECT * FROM ${Credentials.TABLE} WHERE email = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const results = stmt.get(email);
        return results !== undefined;
    }

    /**
     * Remove a user if it exists.
     * Return true if the user did exist, otherwise false.
     */
    removeUser(username) {
        const sql = `DELETE FROM ${Credentials.TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const info = stmt.run(username);
        return info.changes > 0;
    }
}

export { Credentials as default }