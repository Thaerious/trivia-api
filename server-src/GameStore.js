import CONST from "./constants.js";
import sqlite3 from "better-sqlite3";
import Credentials from "./Credentials.js";

class GameStore {
    static DIR_TABLE = 'gs_dir';
    static DATA_TABLE = 'gs_data';
    static CAT_TABLE = 'gs_categories';

    constructor(dbFile) {
        this.dbFile = dbFile;
        this.sqlOptions = { verbose : console.log };
    }

    create() {
        new sqlite3(this.dbFile, this.sqlOptions).prepare(`
            CREATE TABLE IF NOT EXISTS ${GameStore.DIR_TABLE} (
                gameid INTEGER PRIMARY KEY AUTOINCREMENT,
                gamename VARCHAR(32),
                username VARCHAR(64) REFERENCES ${Credentials.TABLE}(username),
                UNIQUE(gamename, username)
            )`)
            .run();

        new sqlite3(this.dbFile, this.sqlOptions).prepare(`
            CREATE TABLE IF NOT EXISTS ${GameStore.CAT_TABLE} (
                gameid INTEGER REFERENCES ${GameStore.DIR_TABLE}(gameid),
                round INTEGER,
                col INTEGER,
                desc VARCHAR(64)
            )`)
            .run();

        new sqlite3(this.dbFile, this.sqlOptions).prepare(`
            CREATE TABLE IF NOT EXISTS ${GameStore.DATA_TABLE} (
                gameid INTEGER REFERENCES ${GameStore.DIR_TABLE}(gameid),
                round INTEGER,
                col INTEGER,
                row INTEGER,
                value INTEGER,
                question VARCHAR(256),
                answer VARCHAR(256),
                PRIMARY KEY(gameid, round, col, row)
            )`)
            .run();

        return this;
    }

    newGame(gamename, username) {
        if (!username) throw new Error(`undefined username`);
        if (!gamename) throw new Error(`undefined gamename`);

        const sql = `INSERT INTO ${GameStore.DIR_TABLE} (gamename, username) VALUES (?, ?)`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        return stmt.run(gamename, username).lastInsertRowid;
    }

    deleteGame(gamename, username) {
        if (!username) throw new Error(`undefined username`);
        if (!gamename) throw new Error(`undefined gamename`);

        const sql = `DELETE FROM ${GameStore.DIR_TABLE} WHERE gamename = ? AND username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        return stmt.run(gamename, username);
    }

    getGame(gameid) {
        if (!gameid) throw new Error(`undefined gameid`);

        const sql = `SELECT * FROM ${GameStore.DIR_TABLE} WHERE gameid = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const row = stmt.get(gameid);
        return row;
    }

    listGames(username) {
        if (!username) throw new Error(`undefined username`);

        const sql = `SELECT gamename FROM ${GameStore.DIR_TABLE} WHERE username = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const rows = stmt.all(username);

        const games = [];
        for (const row of rows) {
            games.push(row.gamename);
        }

        return games;
    }

    addQuestion(data) {
        const sql = `INSERT INTO ${GameStore.DATA_TABLE} VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        return stmt.run(
            data.gameid,
            data.round,
            data.col,
            data.row,
            data.value,
            data.question,
            data.answer
        ).lastInsertRowid;
    }

    getQuestion(data) {
        const sql = `SELECT * FROM ${GameStore.DATA_TABLE}
            WHERE gameid = ?
            AND round = ?
            AND col = ?
            AND row = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const row = stmt.get(data.gameid, data.round, data.col, data.row);
        return row;
    }

    deleteQuestion({gameid, round, col, row}) {
        const sql = `DELETE FROM ${GameStore.DATA_TABLE}
            WHERE gameid = ?
            AND round = ?
            AND col = ?
            AND row = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const info = stmt.run(gameid, round, col, row);
        return info;
    }

    setCategory({gameid, round, col, description}) {
        const sql = `INSERT INTO ${GameStore.CAT_TABLE} VALUES (?, ?, ?, ?)`;
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
        console.log(this.allCategories({ gameid: gameid, round: round }));

        const r = {
            categories: this.allCategories({ gameid: gameid, round: round }),
            values: {
                1: {},
                2: {},
                3: {},
                4: {},
                5: {},
            }            
        };

        const sql = `SELECT * FROM ${GameStore.DATA_TABLE}
            WHERE gameid = ?
            AND round = ?`;
        const stmt = new sqlite3(this.dbFile, this.sqlOptions).prepare(sql);
        const rows = stmt.all(gameid, round);

        for (const row of rows) {
            r.values[row.row][row.col] = row.value;
        }
        return r;              
    }
}

export default GameStore;