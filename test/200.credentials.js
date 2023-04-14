import assert from "assert";
import Path from "path";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs";
import DBHash from "../server-src/models/DBHash.js";
import CONST from "../server-src/constants.js";
import { createConfirmationURL } from "../server-src/routes/enabled/200.credentials.js";

const args = new ParseArgs().run();

describe("200.credentials.js", function () {
    before(function () {});
    after(function () {});

    describe("#createConfirmationURL", function () {
        describe("create a single credential", function () {
            before(function () {
                createConfirmationURL("Maja Barabal", this.confHash);               
            });

            it("confHash.getHash returns a hash code", function () {

            });

            // it("confHash.hasHash returns true", function () {
            //     const hash = this.confHash.getHash("Maja Barabal");
            //     const actual = this.confHash.hasHash(hash);
            //     assert.ok(actual);
            // });

            // describe("create a second credential with the same value", function () {
            //     before(function () {
            //         createConfirmationURL("Bacchus Henriëtte", this.confHash);
            //         this.firstHash = this.confHash.getHash("Bacchus Henriëtte");
            //         createConfirmationURL("Bacchus Henriëtte", this.confHash);
            //         this.secondHash = this.confHash.getHash("Bacchus Henriëtte");
            //     });

            //     it("confHash.getHash returns the most recent hash", function () {
            //         const actual = this.confHash.getHash("Bacchus Henriëtte");
            //         assert.strictEqual(actual, this.secondHash);
            //     });
            // });
        });
    });
});
