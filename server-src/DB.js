import { mkdirif } from "@thaerious/utility";
import sqlite3 from "better-sqlite3";
import FS from "fs";

class DB {
    /**
     * Copy empty database file to database file if the empty file does not exist.
     * The empty file is the state of the database before any user data has been entered.
     */
    constructor(dbFile) {
        this.dbFile = dbFile || ":memory:";
    }

    /**
     * Creates a new database connection. If the database file (dbFile in constructor) does not 
     * exist, it is created.  If the connection is already open no change occurs.
     */
    open() {
        return new sqlite3(this.dbFile);
    }

    tables() {
        const stmt = this.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'");
        return stmt.all();
    }
}

export default DB;