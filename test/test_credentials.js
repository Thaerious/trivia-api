import assert from "assert";
import Path from "path";
import FS from "fs";
import Credentials from "../server-src/models/Credentials.js";
import ParseArgs from "@thaerious/parseargs";
const args = new ParseArgs().run();

const DB_FILE = Path.join("test", "db", "test_credentials.db");

describe("Test Credentials.js", function () {
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

                Credentials.createTables();
                this.credentials = new Credentials({ "username": "adam" });
            } catch (err) {
                console.log(err);
            }
        });

        it("Instance exists", function () {
            assert.ok(this.credentials);
        });

        it("DB file exists", function () {
            assert.ok(FS.existsSync(DB_FILE));
        });

        it("DB row exists", function () {
            const row = Credentials.factory.prepare("SELECT * FROM credentials").get();
            assert.ok(row);
        });          

        it("DB row has correct username", function () {
            const row = Credentials.factory.prepare("SELECT * FROM credentials").get();
            assert.strictEqual(row.username, "adam");
        });              
    });

    describe("Set password", function () {
        before(function () {
            try {
                this.credentials = new Credentials({ "username": "eve" });
                this.credentials.setPW("supersecret");
            } catch (err) {
                console.log(err);
            }
        });

        it("Hash exists", function () {
            assert.ok(this.credentials.hash);
        });

        it("Resetting password changes hash", async function () {
            const prev = this.credentials.hash;
            await this.credentials.setPW("newsecret");
            assert.notStrictEqual(this.credentials.hash, prev);
        });   

        it("DB row has correct hash", function () {
            const row = Credentials.factory.prepare("SELECT * FROM credentials WHERE username = 'eve'").get();
            assert.strictEqual(row.hash, this.credentials.hash);
        });          
    });    

    describe("Validate password", function () {
        before(function () {
            try {
                this.credentials = new Credentials({ "username": "able" });
                this.credentials.setPW("supersecret");
            } catch (err) {
                console.log(err);
            }
        });

        it("Returns true when correct", function () {
            this.credentials.setPW("mysecret");
            assert.ok(this.credentials.validatePW("mysecret"));
        });          
          
        it("Returns false when incorrect", function () {
            this.credentials.setPW("mysecret");
            assert.ok(this.credentials.validatePW("notmysecret"));
        });          
    });     
    
    describe("Username is not unique", function () {
        it("Throws exception", function () {
            try {
                new Credentials({ "username": "cain" });
                new Credentials({ "username": "cain" }); 
            } catch (err) {
                return assert.ok(true);
            }          
            assert.ok(false);
        });          
    });     

    describe("Construct with string", function () {
        before(function () {
            try {
                this.credentials = new Credentials("robert");
            } catch (err) {
                console.log(err);
            }
        });

        it("Object exists", function () {            
            assert.ok(this.credentials);
            assert.strictEqual("robert", this.credentials.username);
        });

        it("DB row exists", function () {
            const row = Credentials.factory.prepare("SELECT * FROM credentials WHERE username = 'robert'").get();
            assert.ok(row);
        });          

        it("DB row has correct username", function () {
            const row = Credentials.factory.prepare("SELECT * FROM credentials WHERE username = 'robert'").get();
            assert.strictEqual(row.username, "robert");
        });          
    });      

});