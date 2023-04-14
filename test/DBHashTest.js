import assert from "assert";
import Path from "path";
import FS from "fs";
import DB from "../server-src/DB.js";
import DBHash from "../server-src/DBHash.js";
import ParseArgs from "@thaerious/parseargs";
const args = new ParseArgs().run();

const TEST_PATH = Path.join("test", "db", "test_credentials.db");
const TEST_TABLE = "test_hash_table";

const res = {
    set: function () { },
    write: function () { },
    end: function () { }
}

describe("DBHash.js", function () {
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

    describe("Create new table", function () {
        before(function () {
            this.dbHash = new DBHash(TEST_PATH, TEST_TABLE);
            this.dbHash.create();
        });

        it("The db file is created when it doesn't already exist", function () {
            assert.ok(
                FS.existsSync(TEST_PATH)
            );
        });

        describe("Attempt to retrieve an unknown hash", function () {
            it("returns undefined", function () {
                const actual = this.dbHash.getValue("abc123"); 
                assert.strictEqual(actual, undefined);
            });
        })
    });

    describe("Add an item to the table", function () {
        before(function () {
            this.dbHash = new DBHash(TEST_PATH, TEST_TABLE);
            this.dbHash.setValue("abc123", "apple");
        });

        it("retrieving the key gives the same value", function () {
            const actual = this.dbHash.getValue("abc123");
            assert.strictEqual(actual, "apple");
        });

        it("overwriting a key will retrieve the latest value", function () {
            this.dbHash.setValue("abc123", "banana");
            const actual = this.dbHash.getValue("abc123");
            assert.strictEqual(actual, "banana");
        });      
        
        it("using #hasHash with the key returns true", function () {
            assert.ok(this.dbHash.hasHash("abc123"));
        });            
    });

    describe("Remove an item", function () {
        before(function () {
            this.dbHash = new DBHash(TEST_PATH, TEST_TABLE);
            this.dbHash.setValue("ab389d", "apple");
            delete this.dbHash.remove("ab389d");
        });

        it("#hasHash operator returns false", function () {
            const actual = this.dbHash.hasHash("ab389d");
            assert.ok(!actual);
        });

        it("getter returns undefined", function () {
            const actual = this.dbHash.getValue("ab389d");
            assert.strictEqual(actual, undefined);
        });        
    });

    describe("Use .assign() to fill a value with a random hash", function () {
        before(function () {
            this.dbHash = new DBHash(TEST_PATH, TEST_TABLE);
            this.hash = this.dbHash.assign("apple", 8);
        });

        it("'in' operator returns true", function () {
            assert.ok(this.dbHash.hasHash(this.hash));
        });

        it("hex results in a string of length 16", function () {
            const actual = this.hash.length;
            assert.strictEqual(actual, 16);
        });       

        it("#getHash returns the most recent when there are multiple hashes of the same value.", function () {
            this.dbHash.assign("apple", 8);
            this.dbHash.assign("apple", 8);
            const hash = this.dbHash.assign("apple", 8);
            assert.strictEqual(this.dbHash.getHash("apple"), hash);
        });
    });

    describe("Verify (#verify) a hash to determine if it's the most recent valid hash", function () {
        before(function () {
            this.dbHash = new DBHash(TEST_PATH, TEST_TABLE);
            this.hash1 = this.dbHash.assign("Gerhild Radúz", 8);
            this.hash2 = this.dbHash.assign("Gerhild Radúz", 8);
        });        

        it("Returns false for the first hash", function () {
            const actual = this.dbHash.verify(this.hash1);
            assert.ok(!actual);
        });

        it("Returns true for the second hash", function () {
            const actual = this.dbHash.verify(this.hash2);
            assert.ok(actual);
        });        
    });

    describe("#RemoveValue - Create two hashes for the same value then remove them", function () {
        before(function () {
            this.dbHash = new DBHash(TEST_PATH, TEST_TABLE);
            this.hash1 = this.dbHash.assign("Cefin Ajit", 8);
            this.hash2 = this.dbHash.assign("Cefin Ajit", 8);
            this.dbHash.removeValue("Cefin Ajit");
        });        

        it("Removes the first hash value", function () {
            const actual = this.dbHash.hasHash(this.hash1);
            assert.ok(!actual);
        });

        it("Removes the second hash value", function () {
            const actual = this.dbHash.hasHash(this.hash2);
            assert.ok(!actual);
        });        
    });    
});