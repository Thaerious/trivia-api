import assert from "assert";
import Path from "path";
import FS from "fs";
import DB from "../server-src/DB.js";
import DBHash from "../server-src/DBHash.js";
import ParseArgs from "@thaerious/parseargs";
const args = new ParseArgs().run();

const TEST_PATH = Path.join("test", "db", "test_game_store.db");

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

    describe("Create new game store", function () {
        before(function () {
            this.dbHash = new DBHash(TEST_PATH, TEST_TABLE);
            this.dbHash.create();
        });

        it("The database file exists", function () {
            assert.ok(
                FS.existsSync(TEST_PATH)
            );
        });
    })
});