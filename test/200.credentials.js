import assert from "assert";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs";
import CONST from "../server-src/constants.js";
import logger from "../server-src/setupLogger.js";
import { CredentialsHandler } from "../server-src/routes/enabled/200.credentials.js";
import res from "./extra/res.js";
import Credentials from "../server-src/models/Credentials.js";

// npx mocha --env ./test/.env ./test/200.credentials.js

const args = new ParseArgs().run();

describe("200.credentials.js", function () {
    before(function () {
        if (FS.existsSync(CONST.DB.PRODUCTION)) {
            logger.verbose(`Before: Removing database '${CONST.DB.PRODUCTION}'`);
            FS.rmSync(CONST.DB.PRODUCTION, { recursive: true });
        }
    });

    // after(function () {
    //     if (!args.flags["no-clean"]) {
    //         if (FS.existsSync(CONST.DB.PRODUCTION)) {
    //             logger.verbose(`After: Removing database '${CONST.DB.PRODUCTION}'`);
    //             setTimeout(
    //                 () => FS.rmSync(CONST.DB.PRODUCTION, { recursive: true }),
    //                 1000
    //             );
    //         }
    //     }
    // });

    describe("CredentialsHandler", function () {
        before(function () { 
            this.credHnd = new CredentialsHandler();
        });

        describe("#register", function () {
            before(function () {
                const req = {
                    body: {
                        "username": "Maja Barabal",
                        "email": "maja@gmail.com",
                        "password" : "supersecret"
                    }
                }
                this.credHnd.register(req, res);
                console.log(res);
            });

            it("", function () {
                const cred = Credentials.$load({ "username": "Maja Barabal" });                
                assert.strictEqual(cred[0].$data.username, "Maja Barabal");
                assert.strictEqual(cred[0].$data.email, "maja@gmail.com");
                assert.ok(cred[0].$data.hash);
                console.log(cred[0].$data);
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
