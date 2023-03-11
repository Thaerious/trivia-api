import crypto from "crypto";
import sqlite3 from "better-sqlite3";

class DBHash {
    /**
     * Use the specified DB object for this manager.
     */
    constructor(dbFile, table = "hash_table") {
        this.dbFile = dbFile;
        this.table = table;
    }

    create() {
        new sqlite3(this.dbFile).prepare(`
            CREATE TABLE IF NOT EXISTS ${this.table} ( \
                idx INTEGER PRIMARY KEY AUTOINCREMENT, \
                hash VARCHAR(64), \
                value VARCHAR(64), \
                created DATE DEFAULT (datetime('now','localtime'))
            )`)
        .run();
        return this;
    }

    getValue(hash) {
        const sql = `SELECT value, MAX(idx) FROM ${this.table} WHERE hash = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);        
        const row = stmt.get(hash);   
        if (!row) return undefined;
        if (!row.value) return undefined;
        return row.value;         
    }

    setValue(hash, value) {
        const sql = `INSERT OR REPLACE INTO ${this.table} (hash, value) VALUES (?, ?)`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);        
        const info = stmt.run(hash, value);          
        return info.changes;
    }

    hasHash(hash) {
        const sql = `SELECT hash, MAX(idx) FROM ${this.table} WHERE hash = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);        
        const row = stmt.get(hash);
        if (!row) return false;
        if (!row.hash) return false;
        return true;
    }

    getHash(value) {
        const sql = `SELECT hash, MAX(idx) as newest FROM ${this.table} WHERE value = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);        
        const row = stmt.get(value);
        return row?.hash;                
    }

    remove(hash) {
        const sql = `DELETE FROM ${this.table} WHERE hash = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);        
        const info = stmt.run(hash);
        return info.changes;
    }

    removeValue(value) {
        const sql = `DELETE FROM ${this.table} WHERE value = ?`;
        const stmt = new sqlite3(this.dbFile).prepare(sql);        
        const info = stmt.run(value);
        return info.changes;
    }    

    /**
     * Returns true if the provided hash exists and is the most recent hash for
     * it's value.
     */
    verify(hash) {
        const value = this.getValue(hash);
        if (!value) return false;
        const latest = this.getHash(value);
        return latest === hash;
    }

    /**
     * Assign a hex-hash of a encoding a specified number of bytes.
     * The string length will change depending on the encoding.
     * Returns the hash string.
     */
    assign(value, bytes = 16, encoding = 'hex') {
        const hash = crypto.randomBytes(bytes).toString(encoding);
        this.setValue(hash, value);
        return hash;
    }
}

export default (DBHash);