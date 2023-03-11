import assert from "assert";
import Path from "path";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs";
import DBHash from "../server-src/DBHash.js";
import CONST from "../server-src/constants.js";
import { createConfirmationURL } from "../server-src/routes/enabled/200.credentials.js";

const DBPATH = Path.join("test", "db", "test_credentials.db");
const args = new ParseArgs().run();

describe("200.credentials.js", function () {
    before(function () {
        if (FS.existsSync(DBPATH)) {
            console.log(`Before: Removing database '${DBPATH}'`);
            FS.rmSync(DBPATH, { recursive: true });
        }
        this.confHash = new DBHash(DBPATH, CONST.DB.TABLE.EMAIL_CONF).create();
    });

    after(function () {
        if (!args.flags["no-clean"]) {
            if (FS.existsSync(DBPATH)) {
                console.log(`After: Removing database '${DBPATH}'`);
                FS.rmSync(DBPATH, { recursive: true });
            }
        }
    });

    describe("#createConfirmationURL", function () {
        describe("create a single credential", function () {
            before(function () {
                createConfirmationURL("Maja Barabal", this.confHash);
            });

            it("confHash.getHash returns a hash code", function () {
                const actual = this.confHash.getHash("Maja Barabal");
                assert.ok(actual);
            });

            it("confHash.hasHash returns true", function () {
                const hash = this.confHash.getHash("Maja Barabal");
                const actual = this.confHash.hasHash(hash);
                assert.ok(actual);
            });

            describe("create a second credential with the same value", function () {
                before(function () {
                    createConfirmationURL("Bacchus Henriëtte", this.confHash);
                    this.firstHash = this.confHash.getHash("Bacchus Henriëtte");
                    createConfirmationURL("Bacchus Henriëtte", this.confHash);
                    this.secondHash = this.confHash.getHash("Bacchus Henriëtte");
                });

                it("confHash.getHash returns the most recent hash", function () {
                    const actual = this.confHash.getHash("Bacchus Henriëtte");
                    assert.strictEqual(actual, this.secondHash);
                });
            });
        });
    });

    // /**
    //  * Log a user into the system.  
    //  * Responds with rejected or exception if the username is invalid or the password does not match.
    //  * Responds with success if the user has been logged in.
    //  * Saves a session hash on success.
    //  */
    // describe("#login", function () {
    //     describe("user logs in and confirms", function () {
    //     before(function () {

    //     });
    // });

});
