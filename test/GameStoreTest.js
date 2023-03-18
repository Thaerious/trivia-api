import assert from "assert";
import Path from "path";
import FS from "fs";
import Credentials from "../server-src/Credentials.js";
import GameStore from "../server-src/GameStore.js";
import ParseArgs from "@thaerious/parseargs";
import { SqliteError } from "better-sqlite3";
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
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
        });

        it("The database file exists", function () {
            assert.ok(
                FS.existsSync(TEST_PATH)
            );
        });
    })

    describe("Attempt to create a game without a valid user", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
        });

        it("An SqliteError is thrown", function () {
            try {
                this.gameStore.newGame("my game", "danuta");
            } catch (e) {
                assert.ok(e instanceof SqliteError);
            }
        });
    })   

    describe("Create new game with a valid user", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
            
            this.credentials.addUser("danuta", "danuta@mail.com", "supersecret");
            this.gameID = this.gameStore.newGame({ gamename: "my first game", username: "danuta"});
        });

        it("The game id returned by newGame exists", function () {
            assert.ok(this.gameID);
        });

        it("Retrieving the game by the id returns the correct game", function () {
            const gameinfo = this.gameStore.getGame({ gameid: this.gameID });
            console.log(gameinfo);
            assert.strictEqual(gameinfo.gameid, this.gameID);
            assert.strictEqual(gameinfo.gamename, "my first game");
            assert.strictEqual(gameinfo.username, "danuta");
        });
    })    

    describe("Delete game from store", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
            
            this.credentials.addUser("rashid", "rashid@mail.com", "supersecret");
            this.gameID1 = this.gameStore.newGame({gamename: "my first game", username: "rashid"});
            this.gameID2 = this.gameStore.newGame({gamename: "my second game", username: "rashid"});
            this.gameStore.deleteGame({gamename: "my first game", username: "rashid"});
            this.gameID3 = this.gameStore.newGame({gamename: "my third game", username: "rashid"});
        });

        it("The list has two entries", function () {
            const actual = this.gameStore.listGames({username: "rashid"});
            assert.ok(actual.length, 2);
        });

        it("The first game doesn't exist", function () {
            const actual = this.gameStore.getGame({gameid: this.gameID1});
            assert.ok(!actual);
        });

        it("The second game does exist", function () {
            const actual = this.gameStore.getGame({gameid: this.gameID2});
            assert.ok(actual);
        });
        
        it("The third game does exist", function () {
            const actual = this.gameStore.getGame({gameid: this.gameID3});
            assert.ok(actual);
        });
    })    

    describe("List games for user", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
            
            this.credentials.addUser("abdur", "abdur@mail.com", "supersecret");
            this.gameID1 = this.gameStore.newGame({gamename: "my first game", username: "abdur"});
            this.gameID2 = this.gameStore.newGame({gamename: "my second game", username: "abdur"});
            this.gameStore.deleteGame({gamename: "my first game", username: "abdur"});
            this.gameID3 = this.gameStore.newGame({gamename: "my third game", username: "abdur"});
        });

        it("The list has two entries", function () {
            const actual = this.gameStore.listGames({username: "abdur"});
            assert.ok(actual.length, 2);
        });

        it("The list does not contain the first game", function () {
            const actual = this.gameStore.listGames({username: "abdur"});
            assert.strictEqual(actual.indexOf("my first game"), -1);
        });   

        it("The list contains the second game", function () {
            const actual = this.gameStore.listGames({username: "abdur"});
            assert.notStrictEqual(actual.indexOf("my second game"), -1);
        });        

        it("The list contains the third game", function () {
            const actual = this.gameStore.listGames({username: "abdur"});
            assert.notStrictEqual(actual.indexOf("my third game"), -1);
        });              
    })        

    describe("Add & retrieve questions", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
            
            this.credentials.addUser("socrates", "socrates@mail.com", "supersecret");
            this.gameID = this.gameStore.newGame({gamename: "my first game", username: "socrates"});
            
            this.gameStore.addQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1,
                value: 100,
                question: "Who is a teapot?",
                answer: "I am a teapot."
            });

            this.question = this.gameStore.getQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1
            });
        });

        it("Retrieved question matches inserted question", function () {
            assert.strictEqual(this.question.value, 100);
            assert.strictEqual(this.question.question, "Who is a teapot?");
            assert.strictEqual(this.question.answer, "I am a teapot.");
        });
           
    })     
    
    describe("Add, delete & retrieve questions", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
            
            this.credentials.addUser("Ninsun", "Ninsun@mail.com", "supersecret");
            this.gameID = this.gameStore.newGame({gamename: "my first game", username: "Ninsun"});
            
            this.gameStore.addQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1,
                value: 100,
                question: "Who is a teapot?",
                answer: "I am a teapot."
            });

            this.gameStore.deleteQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1
            });

            this.question = this.gameStore.getQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1
            });
        });

        it("Retrieved question is undefined", function () {
            assert.ok(!this.question);
        });
           
    })        

    describe("Add, delete & retrieve questions", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
            
            this.credentials.addUser("Yaffe", "Yaffe@mail.com", "supersecret");
            this.gameID = this.gameStore.newGame({gamename: "my first game", username: "Yaffe"});
            
            this.gameStore.addQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1,
                value: 100,
                question: "Who is a teapot?",
                answer: "I am a teapot."
            });

            this.gameStore.deleteQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1
            });

            this.question = this.gameStore.getQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1
            });
        });

        it("Retrieved question is undefined", function () {
            assert.ok(!this.question);
        });
           
    })      

    describe("Set & get category title", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
            
            this.credentials.addUser("Ottmar", "Ottmar@mail.com", "supersecret");
            this.gameID = this.gameStore.newGame({gamename: "my first game", username: "Ottmar"});
            
            this.gameStore.setCategory({
                gameid: this.gameID,
                round: 1,
                col: 1,
                description: "Famous Songs"
            });

            this.gameStore.setCategory({
                gameid: this.gameID,
                round: 1,
                col: 2,
                description: "Famous People"
            });            

            this.description = this.gameStore.getCategory({
                gameid: this.gameID,
                round: 1,
                col: 1
            });
        });

        it("Descriptions match", function () {
            assert.strictEqual(this.description, "Famous Songs");
        });
           
        it("Retrieve all categories", function () {
            const categories = this.gameStore.allCategories({gameid: this.gameID, round : 1});
            assert.strictEqual(categories[1], "Famous Songs");
            assert.strictEqual(categories[2], "Famous People");
        });        
    })      

    describe("Retrieve an entire round", function () {
        before(function () {
            this.gameStore = new GameStore(TEST_PATH);
            this.credentials = new Credentials(TEST_PATH);
            this.gameStore.create();            
            this.credentials.create();
            
            this.credentials.addUser("Pallabi", "Pallabi@mail.com", "supersecret");
            this.gameID = this.gameStore.newGame({gamename: "my first game", username: "Pallabi"});
            
            this.gameStore.setCategory({
                gameid: this.gameID,
                round: 1,
                col: 1,
                description: "Famous Songs"
            });

            this.gameStore.setCategory({
                gameid: this.gameID,
                round: 1,
                col: 2,
                description: "Famous People"
            });  

            this.gameStore.addQuestion({
                gameid: this.gameID,
                round: 1,
                row: 1,
                col: 1,
                value: 100,
                question: "Who is a teapot?",
                answer: "I am a teapot."
            });

            this.round = this.gameStore.getRound({ gameid: this.gameID, round: 1 });
        });

        it("Check round", function () {
            console.log(this.round);
            assert.strictEqual(this.round.categories[1], "Famous Songs");
            assert.strictEqual(this.round.categories[2], "Famous People");
            assert.strictEqual(this.round.values[1][1], 100);
        });           
    })      
});