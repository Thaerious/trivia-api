import crypto from "crypto";
import ModelFactory from "@thaerious/sql-model-factory";

const model = {
    "hash": "VARCHAR(64)",
    "value": "VARCHAR(64)",
    "created": "DATE DEFAULT (datetime('now','localtime'))"
}

class DBHash {
    static hasHash(hash) {
        const row = this
            .$prepare(`SELECT hash, MAX(idx) FROM ${this.table} WHERE hash = ?`)
            .get(hash);

        if (!row) return false;
        if (!row.hash) return false;
        return (true);
    }

    static getHash(value) {
        return this
            .$prepare(`SELECT hash, MAX(idx) FROM ${this.table} WHERE hash = ?`)
            .get(hash)
            ?.hash;           
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
    assignNewHash(bytes = 16, encoding = 'hex') {
        this.hash = crypto.randomBytes(bytes).toString(encoding);
        return this.hash;
    }
}

export default new ModelFactory().createClass(model, DBHash);