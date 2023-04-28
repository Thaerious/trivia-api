import assert from "assert";
import Path from "path";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs";
import DBHash from "../server-src/DBHash.js";
import CONST from "../server-src/constants.js";
import {login, createConfirmationURL } from "../server-src/routes/enabled/200.credentials.js";
import res from "./extra/res.js";

const DBPATH = Path.join("test", "db", "test_credentials.db");
const args = new ParseArgs().run();

describe("200.credentials.login.js", function () {
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

    before(function () {
        this.credentials = new Credentials(CONST.DB.PRODUCTION).create();
        this.confHash = new DBHash(CONST.DB.PRODUCTION, CONST.DB.TABLE.EMAIL_CONF).create();
    });

    describe("confirmed user", function () {
        before(function () {
            this.credentials.addUser("Vsevolod Ranj", "vsevolod@gmail.com", "supersecret");
            createConfirmationURL("Maja Barabal", this.confHash);
            this.hash = new DBHash(CONST.DB.PRODUCTION, CONST.DB.TABLE.EMAIL_CONF).create().getHash("Maja Barabal");
            confirm(this.hash);
        });       
    });

    describe("unconfirmed user", function () {
    });

    describe("unknown user", function () {
    });
});
