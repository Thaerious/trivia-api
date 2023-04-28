import assert from "assert";
import Path from "path";
import FS from "fs";
import Credentials from "../server-src/models/Credentials.js";
import GameModel from "../server-src/models/GameModel.js";
import GameInstance from "../server-src/models/GameInstance.js";
import ParseArgs from "@thaerious/parseargs";
const args = new ParseArgs().run();

const DB_FILE = Path.join("test", "db", "test_game_instance.db");

describe("Test GameInstance.js", function () {
    before(function () {
        if (FS.existsSync(DB_FILE)) {
            console.log(`  Before: Removing database '${DB_FILE}'`);
            FS.rmSync(DB_FILE, { recursive: true });
        }
    });

    after(function () {
        if (!args.flags["no-clean"]) {
            if (FS.existsSync(DB_FILE)) {
                console.log(`  After: Removing database '${DB_FILE}'`);
                FS.rmSync(DB_FILE, { recursive: true });
            }
        }
    });

    describe("Sanity Check", function () {
        before(function () {
            try {
                Credentials.factory.dbFile = DB_FILE;
                GameModel.factory.dbFile = DB_FILE;
                GameInstance.factory.dbFile = DB_FILE;

                Credentials.createTables();
                GameModel.createTables();
                GameInstance.createTables();

                const credentials = new Credentials({ username: "adam" });
                const model = new GameModel({ owner: credentials, gamename: "adam's game" });
                this.gameInstance = new GameInstance({ owner: credentials, model: model });
            } catch (err) {
                console.log(err);
            }
        });

        after(function () {
            GameModel.factory.close();
        });

        it("Instance exists", function () {
            assert.ok(this.gameInstance);
        });

        it("DB file exists", function () {
            assert.ok(FS.existsSync(DB_FILE));
        });

        it("DB row exists", function () {            
            const row = GameModel.factory.prepare("SELECT * FROM gameInstance").get();
            assert.ok(row);
        });          

        // it("DB row has correct game name", function () {
        //     const row = Credentials.factory.prepare("SELECT * FROM gameInstance").get();
        //     assert.strictEqual(row.gamename, "adam's game");
        // });              
    });
});