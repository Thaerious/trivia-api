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

    init() {
        new sqlite3(this.dbFile).prepare(`
            CREATE TABLE IF NOT EXISTS ${this.table} ( \
                username varchar(64) primary key, \
                email varchar(64), \
                hash varchar(64)
            )`)
        .run();
        return this;
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

        const sql = "INSERT INTO users (username, email) VALUES (?, ?)";
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
        const sql = "UPDATE users SET hash = ? WHERE username = ?";
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        stmt.run(hash, username);

        return hash;
    }

    getHash(username) {
        if (!username) throw new Error(`undefined username`);
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const sql = "SELECT * FROM users WHERE username = ?";
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const row = stmt.get(username);
        return row.hash;
    }

    async validateHash(username, password) {
        if (!this.hasUser(username)) throw new Error(`unknown user: ${username}`);

        const sql = "SELECT * FROM users WHERE username = ?";
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

        const sql = "UPDATE users SET email = ? WHERE username = ?";
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
        const sql = "SELECT * FROM users WHERE username = ?";
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const results = stmt.get(username);

        return new User(results.username, results.email);
    }

    /**
     * True if the username exists, otherwise false.
     */
    hasUser(username) {
        const sql = "SELECT * FROM users WHERE username = ?";
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const results = stmt.get(username);
        return results !== undefined;
    }

    /**
     * True if the email has alredy been used, otherwise false.
     */
    hasEmail(email) {
        const sql = "SELECT * FROM users WHERE email = ?";
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const results = stmt.get(email);
        return results !== undefined;
    }

    /**
     * Remove a user if it exists.
     * Return true if the user did exist, otherwise false.
     */
    removeUser(username) {
        const sql = "DELETE FROM users WHERE username = ?";
        const stmt = new sqlite3(this.dbFile).prepare(sql);
        const info = stmt.run(username);
        return info.changes > 0;
    }
}

export { Credentials as default, User }