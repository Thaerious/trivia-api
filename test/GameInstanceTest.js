import assert from "assert";
import Path from "path";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs";
import mkdirIf from "@thaerious/utility/src/mkdirif.js";
import { SqliteError } from "better-sqlite3";

import Credentials from "../server-src/Credentials.js";
import GameStore from "../server-src/GameStore.js";
import GameInstanceFactory, { GameInstance } from "../server-src/GameInstance.js";

const args = new ParseArgs().run();

const TEST_PATH = mkdirIf("test", "db", "test_game_instance.db");

describe("GameStore.js", function () {
    before(function () {
        if (FS.existsSync(TEST_PATH)) {
            console.log(`Before: Removing database '${TEST_PATH}'`);
            FS.rmSync(TEST_PATH, { recursive: true });
        }
    });

    after(function () {
        if (!args.flags["no-clean"]) {
            if (FS.existsSync(TEST_PATH)) {
                console.log(`After: Removing database '${TEST_PATH}'`);
                FS.rmSync(TEST_PATH, { recursive: true });
            }
        }
    });

    describe("Create new factory", function () {
        before(function () {
            this.factory = new GameInstanceFactory(TEST_PATH).create();
        });

        it("The database file exists", function () {
            assert.ok(
                FS.existsSync(TEST_PATH)
            );
        });        
    });

    describe("New Instance", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH).create();
            this.credentials = new Credentials(TEST_PATH).create();
            this.factory = new GameInstanceFactory(TEST_PATH).create();

            this.credentials.addUser("danuta", "danuta@mail.com", "supersecret");
            this.gameid = this.gameStore.newGame({ gamename: "my first game", username: "danuta"});            
            this.instance = this.factory.newInstance(this.gameid, "danuta");
        });

        it("Instance is of GameInstance type", function () {
            assert.ok(
                this.instance instanceof GameInstance
            );
        });        
    });   
    
    describe("Retrieve Instance", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH).create();
            this.credentials = new Credentials(TEST_PATH).create();
            this.factory = new GameInstanceFactory(TEST_PATH).create();

            this.credentials.addUser("trey", "trey@mail.com", "supersecret");
            this.gameid = this.gameStore.newGame({ gamename: "my first game", username: "trey"});            
            this.instance = this.factory.newInstance(this.gameid, "trey");
        });

        describe("by id", function () {
            it("Values match", function () {
                const actual = this.instance.getInstance({instanceid : this.instance.instanceid});
                assert.strictEqual(
                    actual.instanceid,
                    this.instance.instanceid
                );
            });
        });
    });        
});