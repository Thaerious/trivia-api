import assert from "assert";
import Path from "path";
import FS from "fs";
import CONST from "../server-src/constants.js";
import Credentials, { User } from "../server-src/Credentials.js";
import ParseArgs from "@thaerious/parseargs";
const args = new ParseArgs().run();

CONST.DB.PRODUCTION = Path.join("test", "db", "test_credentials.db");

describe("Credentials.js", function () {
    before(function () {
        if (FS.existsSync(CONST.DB.PRODUCTION)) {
            console.log(`Before: Removing database '${CONST.DB.PRODUCTION}'`);
            FS.rmSync(CONST.DB.PRODUCTION, { recursive: true });
        }
    });

    after(function () {
        if (!args.flags["no-clean"]) {
            if (FS.existsSync(CONST.DB.PRODUCTION)) {
                console.log(`After: Removing database '${CONST.DB.PRODUCTION}'`);
                FS.rmSync(CONST.DB.PRODUCTION, { recursive: true });
            }
        }
    });

    it("using an unopened connection throws an exception", function () {
        const credentials = new Credentials();

        try {
            credentials.addUser("adam", "adam@eden.com", "noapples");
        } catch (e) {
            assert.ok(e instanceof Error);
        }
    });

    describe("add a user", function () {
        before(function () {
            this.credentials = new Credentials(CONST.DB.PRODUCTION);
            this.credentials.init();
        });

        describe("undefined username", async function () {
            it("throws an exception", async function () {
                try {
                    await this.credentials.addUser(undefined, "adam@eden.com", "noapples");
                } catch (e) {
                    assert.ok(e instanceof Error);
                }
            });
        });

        describe("undefined email", async function () {
            it("throws an exception", async function () {
                try {
                    await this.credentials.addUser("adam", undefined, "noapples");
                } catch (e) {
                    assert.ok(e instanceof Error);
                }
            });
        });

        describe("undefined password", async function () {
            it("throws an exception", async function () {
                try {
                    await this.credentials.addUser("adam", "adam@eden.com", undefined);
                } catch (e) {
                    assert.ok(e instanceof Error);
                }
            });
        });        

        it("#has method returns false on an empty instance (before adding)", function () {
            const actual = this.credentials.hasUser("adam");
            assert.ok(!actual);
        });

        it("returns a user object when successfull", async function () {
            const user = await this.credentials.addUser("adam", "adam@eden.com", "noapples");
            assert.ok(user instanceof User);
        });

        it("#has method returns true after user has been added", function () {
            const actual = this.credentials.hasUser("adam");
            assert.ok(actual);
        });

        it("password hash is not undefined", async function () {
            await this.credentials.addUser("steve", "steve@eden.som", "twoapples");
            const actual = this.credentials.getHash("steve");
            assert.ok(actual);
        });

        it("validate password", async function () {
            const actual = await this.credentials.validateHash("adam", "noapples");
            assert.ok(actual);
        });

        describe("state is persistant, backed by db", function () {
            it("user exists on new credentials object", function () {
                const credentials = new Credentials(CONST.DB.PRODUCTION);
                const actual = credentials.hasUser("adam");
                assert.ok(actual);
            });
        });

        describe("add duplicate user", function () {
            it("throws an error", function () {
                const credentials = new Credentials(CONST.DB.PRODUCTION);

                try {
                    credentials.addUser("adam mcmac", "adam@eden.com", "noapples");
                } catch (e) {
                    assert.ok(e instanceof Error);
                }
            });
        });

        describe("add duplicate email", function () {
            it("throws an error", function () {
                const credentials = new Credentials(CONST.DB.PRODUCTION);

                try {
                    credentials.addUser("adam", "adam@eden.com", "noapples");
                } catch (e) {
                    assert.ok(e instanceof Error);
                }
            });
        });

        describe("remove an existing user", function () {
            before(function () {
                this.r = this.credentials.removeUser("adam");
            });

            it("method returns true when a user was removed", function () {
                assert.ok(this.r);
            });

            it("#has returns false after user is removed", function () {
                assert.ok(!this.credentials.hasUser("adam"));
            });
        });

        describe("remove an unknown user", function () {
            before(function () {
                this.r = this.credentials.removeUser("adam");
            });

            it("method returns false when a user was not removed", function () {
                assert.ok(!this.r);
            });
        });
    });

    describe("assign hash to known user", async function () {
        before(async function () {
            this.credentials = new Credentials(CONST.DB.PRODUCTION);
            await this.credentials.addUser("eve", "eve@eden.com", "noapples");
        });

        it("set hash on player 'eve'", async function () {
            await this.credentials.setHash("eve", "password");
        });

        it("re-set hash on player 'eve'", async function () {
            await this.credentials.setHash("eve", "password");
        });

        it("the email is unchanged", async function () {
            const user = this.credentials.getUser("eve");
            assert.strictEqual(user.email, "eve@eden.com");
        });

        it("throws an exception for unknown user", async function () {
            try {
                await this.credentials.setHash("able", "password");
            } catch (e) {
                assert.ok(e instanceof Error);
            }
        });        
    });

    describe("change a user's hash (password)", async function () {
        before(async function () {
            this.credentials = new Credentials(CONST.DB.PRODUCTION);
            await this.credentials.addUser("able", "able@eden.com", "noapples");
            await this.credentials.setHash("able", "password");
        });

        it("returns true with correct password", async function () {
            const actual = await this.credentials.validateHash("able", "password");
            assert.ok(actual);
        });

        it("returns false with incorrect password", async function () {
            const actual = await this.credentials.validateHash("able", "notpassword");
            assert.ok(!actual);
        });

        it("throws an exception for unknown user", async function () {
            try {
                await this.credentials.validateHash("able", "password");
            } catch (e) {
                assert.ok(e instanceof Error);
            }
        });        
    });

    describe("update a user's email", async function () {
        before(function () {
            this.credentials = new Credentials(CONST.DB.PRODUCTION);
        });

        it("email changes to new value", async function () {
            await this.credentials.addUser("lilith", "lilith@google.ca", "noapples");
            this.credentials.updateUser("lilith", "lilith@microsoft.com");
            const user = this.credentials.getUser("lilith");

            assert.strictEqual(user.email, "lilith@microsoft.com");
        });

        it("throws an exception for unknown user", async function () {
            try {
                this.credentials.updateUser("whom", "lilith@microsoft.com");
            } catch (e) {
                assert.ok(e instanceof Error);
            }
        });
    });

    describe("#hasEmail", async function () {
        before(function () {
            this.credentials = new Credentials(CONST.DB.PRODUCTION);
            this.credentials.init();
        });

        it("returns true if the email is already in use", async function () {
            await this.credentials.addUser("beth", "beth@eden.ca", "supersecret");
            const actual = this.credentials.hasEmail("beth@eden.ca");
        });

        it("returns true if the email is has not been used", async function () {
            const actual = this.credentials.hasEmail("chuck@eden.ca");
        });        
    });
});