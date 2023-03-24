import CONST from "./constants.js";
import sqlite3 from "better-sqlite3";
import Credentials from "./Credentials.js";
import jsonschema from "jsonschema";

class GameStore {
    static DIR_TABLE = 'gs_dir';
    static DATA_TABLE = 'gs_data';
    static CAT_TABLE = 'gs_categories';
    static validator = new jsonschema.Validator();

    constructor(dbFile = CONST.DB.PRODUCTION) {
        this.dbFile = dbFile;
        this.sqlOptions = { verbose: console.log };
    }

    create() {
        new sqlite3(this.dbFile, this.sqlOptions).prepare(`
            CREATE TABLE IF NOT EXISTS ${GameStore.DIR_TABLE} (
                gameid INTEGER PRIMARY KEY AUTOINCREMENT,
                gamename VARCHAR(32) NOT NULL,
                username VARCHAR(32) REFERENCES ${Credentials.TABLE}(username),
                UNIQUE(gamename, username)
            )`)
            .run();

        new sqlite3(this.dbFile, this.sqlOptions).prepare(`
            CREATE TABLE IF NOT EXISTS ${GameStore.CAT_TABLE} (
                gameid INTEGER REFERENCES ${GameStore.DIR_TABLE}(gameid),
                round INTEGER NOT NULL,
                col INTEGER NOT NULL,
                desc VARCHAR(64) NOT NULL,
                UNIQUE(gameid, round, col)
            )`)
            .run();

        new sqlite3(this.dbFile, this.sqlOptions).prepare(`
            CREATE TABLE IF NOT EXISTS ${GameStore.DATA_TABLE} (
                gameid INTEGER REFERENCES ${GameStore.DIR_TABLE}(gameid),
                round INTEGER NOT NULL,
                col INTEGER NOT NULL,
                row INTEGER NOT NULL,
                value INTEGER,
                question VARCHAR(256),
                answer VARCHAR(256),
                PRIMARY KEY(gameid, round, col, row)
            )`)
            .run();

        return this;
    }

    static validate(obj, schema) {
        return this.validator.validate(obj, schema);
    }

    newGame({ gamename, username }) {
        if (this.getGame(arguments[0])) {
            throw new Error(`A game with the name '${gamename}' already exists.`);
        }

        const sql = `INSERT INTO ${GameStore.DIR_TABLE} (gamename, username) VALUES (?, ?)`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        return stmt.run(gamename, username).lastInsertRowid;
    }

    deleteGame({ gameid }) {
        new sqlite3(this.dbFile, this.sqlOptions)
            .prepare(`DELETE FROM ${GameStore.CAT_TABLE} WHERE gameid = ?`)
            .run(gameid);

        new sqlite3(this.dbFile, this.sqlOptions)
            .prepare(`DELETE FROM ${GameStore.DATA_TABLE} WHERE gameid = ?`)
            .run(gameid);

        new sqlite3(this.dbFile, this.sqlOptions)
            .prepare(`DELETE FROM ${GameStore.DIR_TABLE} WHERE gameid = ?`)
            .run(gameid);
    }

    getGame({ gameid, username, gamename }) {
        let field = arguments[0].gameid ? "gameid" : "gamename";
        let value = arguments[0][field];

        const sql = `SELECT * FROM ${GameStore.DIR_TABLE} WHERE ${field} = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);

        return stmt.get(value);
    }

    listGames({ username }) {
        const sql = `SELECT gameid, gamename FROM ${GameStore.DIR_TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const rows = stmt.all(username);

        const games = [];
        for (const row of rows) {
            games.push(row);
        }

        return games;
    }

    addQuestion({ gameid, round, col, row, value, question, answer }) {
        const sql = `INSERT OR REPLACE INTO ${GameStore.DATA_TABLE} VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        return stmt.run(
            gameid,
            round,
            col,
            row,
            value,
            question,
            answer
        ).lastInsertRowid;
    }

    getQuestion({ gameid, round, col, row }) {
        const sql = `SELECT * FROM ${GameStore.DATA_TABLE}
            WHERE gameid = ?
            AND round = ?
            AND col = ?
            AND row = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        return stmt.get(gameid, round, col, row);
    }

    deleteQuestion({ gameid, round, col, row }) {
        const sql = `DELETE FROM ${GameStore.DATA_TABLE}
            WHERE gameid = ?
            AND round = ?
            AND col = ?
            AND row = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const info = stmt.run(gameid, round, col, row);
        return info;
    }

    setCategory({ gameid, round, col, description }) {
        const sql = `INSERT OR REPLACE INTO ${GameStore.CAT_TABLE} VALUES (?, ?, ?, ?)`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        return stmt.run(
            gameid,
            round,
            col,
            description
        ).lastInsertRowid;
    }

    getCategory({ gameid, round, col }) {
        const sql = `SELECT desc FROM ${GameStore.CAT_TABLE}
            WHERE gameid = ?
            AND round = ?
            AND col = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const row = stmt.get(gameid, round, col);
        return row.desc;
    }

    allCategories({ gameid, round }) {
        const sql = `SELECT * FROM ${GameStore.CAT_TABLE}
            WHERE gameid = ?
            AND round = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const rows = stmt.all(gameid, round);

        const categories = {};
        for (const row of rows) {
            categories[row.col] = row.desc;
        }
        return categories;
    }

    getRound({ gameid, round }) {
        const r = {
            categories: this.allCategories({ gameid: gameid, round: round }),
            values: {
                1: {
                    1: {}, 2: {}, 3: {}, 4: {}, 5: {}
                },
                2: {
                    1: {}, 2: {}, 3: {}, 4: {}, 5: {}
                },
                3: {
                    1: {}, 2: {}, 3: {}, 4: {}, 5: {}
                },
                4: {
                    1: {}, 2: {}, 3: {}, 4: {}, 5: {}
                },
                5: {
                    1: {}, 2: {}, 3: {}, 4: {}, 5: {}
                }
            }
        };

        const sql = `SELECT row, col, value FROM ${GameStore.DATA_TABLE}
            WHERE gameid = ?
            AND round = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const rows = stmt.all(gameid, round);

        for (const row of rows) {
            r.values[row.col][row.row].value = row.value;
        }
        return r;
    }
}

GameStore.validator.addSchema({
    "id": "/newGame",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 },
        "gamename": { "type": "string", minLength: 1, maxLength: 32 },
    },
    "required": ["username", "gamename"]
});

GameStore.validator.addSchema({
    "id": "/deleteGame",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 },
        "gamename": { "type": "string", minLength: 1, maxLength: 32 },
    },
    "required": ["gameid"]
});

GameStore.validator.addSchema({
    "id": "/getGame",
    "type": "object",
    "properties": {
        "gameid": { "type": "number" },
        "gamename": { "type": "string" },
        "username": { "type": "string" }
    },
    oneOf: [
        { "required": ["gameid"] },
        { "required": ["gamename", "username"] }
    ]
});

GameStore.validator.addSchema({
    "id": "/listGames",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 }
    },
    "required": ["username"]
});

GameStore.validator.addSchema({
    "id": "/addQuestion",
    "type": "object",
    "properties": {
        "gameid": { "type": "number" },
        "round": { "type": "number" },
        "col": { "type": "number" },
        "row": { "type": "number" },
        "value": {
            "anyOf": [
                { "type": "number" },
                { "type": "null" }
            ]
    },
    "question": { "type": "string", minLength: 0, maxLength: 256 },
    "answer": { "type": "string", minLength: 0, maxLength: 256 }
},
    "required": ["gameid", "round", "col", "row"]
});

GameStore.validator.addSchema({
    "id": "/getQuestion",
    "type": "object",
    "properties": {
        "gameid": { "type": "number" },
        "round": { "type": "number" },
        "col": { "type": "number" },
        "row": { "type": "number" },
    },
    "required": ["gameid", "round", "col", "row"]
});

GameStore.validator.addSchema({
    "id": "/deleteQuestion",
    "type": "object",
    "properties": {
        "gameid": { "type": "number" },
        "round": { "type": "number" },
        "col": { "type": "number" },
        "row": { "type": "number" },
    },
    "required": ["gameid", "round", "col", "row"]
});

GameStore.validator.addSchema({
    "id": "/setCategory",
    "type": "object",
    "properties": {
        "gameid": { "type": "number" },
        "round": { "type": "number" },
        "col": { "type": "number" },
        "description": { "type": "string", minLength: 0, maxLength: 64 },
    },
    "required": ["gameid", "round", "col", "description"]
});

GameStore.validator.addSchema({
    "id": "/getCategory",
    "type": "object",
    "properties": {
        "gameid": { "type": "number" },
        "round": { "type": "number" },
        "col": { "type": "number" }
    },
    "required": ["gameid", "round", "col"]
});

GameStore.validator.addSchema({
    "id": "/allCategories",
    "type": "object",
    "properties": {
        "gameid": { "type": "number" },
        "round": { "type": "number" }
    },
    "required": ["gameid", "round"]
});

GameStore.validator.addSchema({
    "id": "/getRound",
    "type": "object",
    "properties": {
        "gameid": { "type": "number" },
        "round": { "type": "number" }
    },
    "required": ["gameid", "round"]
});

export default GameStore;