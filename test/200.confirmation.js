import CONST from "../server-src/constants.js";
import assert from "assert";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs";
import DBHash from "../server-src/DBHash.js";
import { createConfirmationURL } from "../server-src/routes/enabled/200.credentials.js";
import Credentials from "../server-src/models/Credentials.js";
import { confirm } from "../server-src/routes/enabled/200.confirmation.js";
import logger from "../server-src/setupLogger.js";

const args = new ParseArgs().run();

describe("200.confirmation.js", function () {
    before(function () {
        if (FS.existsSync(CONST.DB.PRODUCTION)) {
            logger.verbose(`Before: Removing database '${CONST.DB.PRODUCTION}'`);
            FS.rmSync(CONST.DB.PRODUCTION, { recursive: true });
        }
        this.confHash = new DBHash(CONST.DB.PRODUCTION, CONST.DB.TABLE.EMAIL_CONF).create();
    });

    after(function () {
        if (!args.flags["no-clean"]) {
            if (FS.existsSync(CONST.DB.PRODUCTION)) {
                logger.verbose(`After: Removing database '${CONST.DB.PRODUCTION}'`);
                FS.rmSync(CONST.DB.PRODUCTION, { recursive: true });
            }
        }
    });

    describe("#confirm - confirm a known user", function () {
        describe("create a single credential", function () {
            before(function () {
                this.credentials = new Credentials(CONST.DB.PRODUCTION);
                this.credentials.create();
                this.credentials.addUser("Panka Madicken", "panka@gmail.com", "supersecret");                
                this.url = createConfirmationURL("Panka Madicken", this.confHash);
                this.hash = new DBHash(CONST.DB.PRODUCTION, CONST.DB.TABLE.EMAIL_CONF).create().getHash("Panka Madicken");
            });

            it("before confirming the user credentials indicates not confirmed", function () {
                const actual = this.credentials.isConfirmed("Panka Madicken");
                assert.ok(!actual);
            });

            it("confirming the user returns true for known & unconfirmed user", function () {
                const actual = confirm(this.hash);
                assert.ok(actual);
            });            
            
            it("confirming the user a second time returns false because the user is already confirmed", function () {
                const actual = confirm(this.hash);
                assert.ok(!actual);
            });     
            
            it("after confirming the user credentials indicates confirmed", function () {
                const actual = this.credentials.isConfirmed("Panka Madicken");
                assert.ok(actual);
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
