import CONST from "./constants.js";
import FS from "fs";
import DB from "./DB.js";
import sqlite3 from "better-sqlite3";
import bcrypt from "bcryptjs";

class User {
    constructor(username, email) {
        this.username = username;
        this.email = email;
    }
}

class Credentials 
{
    constructor(dbFile, table = "users") {
        this.dbFile = dbFile;
        this.table = table;
    }

    create() {
        new sqlite3(this.dbFile).prepare(`
            CREATE TABLE IF NOT EXISTS ${this.table} ( \
                username VARCHAR(64) primary key, \
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

        const sql = `SELECT * FROM ${this.table} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const row = stmt.get(username);
        return row.confirmed !== 0;        
    }

    setConfirmed(username) {
        if (!username) throw new Error(`undefined username`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);
        
        const sql = `UPDATE ${this.table} SET confirmed = 1 WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
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

        const user = new User(username, email);

        const sql = `INSERT INTO ${this.table} (username, email) VALUES (?, ?)`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        stmt.run(username, email);
        await this.setHash(username, password);

        return user;
    }

    /**
     * Assign a hash value to the player based on the argument 'password'.
     */
    async setHash(username, password) {
        if (!username) throw new Error(`undefined username`);
        if (!password) throw new Error(`undefined password`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const hash = await bcrypt.hash(password, CONST.DB.SALT_ITERATIONS);
        const sql = `UPDATE ${this.table} SET hash = ? WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        stmt.run(hash, username);

        return hash;
    }

    getHash(username) {
        if (!username) throw new Error(`undefined username`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const sql = `SELECT * FROM ${this.table} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const row = stmt.get(username);
        return row.hash;
    }

    async validateHash(username, password) {
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const sql = `SELECT * FROM ${this.table} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const row = stmt.get(username); ``

        return bcrypt.compare(password, row.hash);
    }

    /**
     * Change the email for a user.
     * Throws an exception if the user does not exist.
     * No return value.
     */
    updateUser(username, email) {
        if (!this.hasUser(username)) throw new Error(`user already added: ${username}`);
        const user = new User(username, email);

        const sql = `UPDATE ${this.table} SET email = ? WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        stmt.run(email, username);
    }

    /**
     * Retrieve a user if it exists.
     * Throws an exception if the user does not exist.
     * Returns a User object.
     */
    getUser(username) {
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);
        const sql = `SELECT * FROM ${this.table} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const results = stmt.get(username);

        return new User(results.username, results.email);
    }

    /**
     * True if the username exists, otherwise false.
     */
    hasUser(username) {
        const sql = `SELECT * FROM ${this.table} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const results = stmt.get(username);
        return results !== undefined;
    }

    /**
     * True if the email has alredy been used, otherwise false.
     */
    hasEmail(email) {
        const sql = `SELECT * FROM ${this.table} WHERE email = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const results = stmt.get(email);
        return results !== undefined;
    }

    /**
     * Remove a user if it exists.
     * Return true if the user did exist, otherwise false.
     */
    removeUser(username) {
        const sql = `DELETE FROM ${this.table} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const info = stmt.run(username);
        return info.changes > 0;
    }
}

export { Credentials as default, User }