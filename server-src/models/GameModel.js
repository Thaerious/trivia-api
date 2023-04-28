import ModelFactory from "@thaerious/sql-model-factory";
import CONST from "../constants.js";

const factory = ModelFactory.instance;
factory.dbFile = CONST.DB.PRODUCTION;

factory.createClasses({
   "GameModel": {
        "gamename": "VARCHAR(32) NOT NULL",
        "owner": "@Credentials NOT NULL",
        "rounds": [{            
            "columns": [{
                "desc": "VARCHAR(64) NOT NULL",
                "rows": [{
                    "value": "INTEGER",
                    "question": "VARCHAR(256)",
                    "answer": "VARCHAR(256)",                    
                }]
            }]
        }],
        "$append": [
            "UNIQUE(gamename, owner)"
        ]
    },
    "Categories": {
    }
});

export default factory.classes.GameModel;

// GameStore.validator.addSchema({
//     "id": "/newGame",
//     "type": "object",
//     "properties": {
//         "username": { "type": "string", minLength: 1, maxLength: 32 },
//         "gamename": { "type": "string", minLength: 1, maxLength: 32 },
//     },
//     "required": ["username", "gamename"]
// });

// GameStore.validator.addSchema({
//     "id": "/deleteGame",
//     "type": "object",
//     "properties": {
//         "username": { "type": "string", minLength: 1, maxLength: 32 },
//         "gamename": { "type": "string", minLength: 1, maxLength: 32 },
//     },
//     "required": ["gameid"]
// });

// GameStore.validator.addSchema({
//     "id": "/getGame",
//     "type": "object",
//     "properties": {
//         "gameid": { "type": "number" },
//         "gamename": { "type": "string" },
//         "username": { "type": "string" }
//     },
//     oneOf: [
//         { "required": ["gameid"] },
//         { "required": ["gamename", "username"] }
//     ]
// });

// GameStore.validator.addSchema({
//     "id": "/listGames",
//     "type": "object",
//     "properties": {
//         "username": { "type": "string", minLength: 1, maxLength: 32 }
//     },
//     "required": ["username"]
// });

// GameStore.validator.addSchema({
//     "id": "/addQuestion",
//     "type": "object",
//     "properties": {
//         "gameid": { "type": "number" },
//         "round": { "type": "number" },
//         "col": { "type": "number" },
//         "row": { "type": "number" },
//         "value": {
//             "anyOf": [
//                 { "type": "number" },
//                 { "type": "null" }
//             ]
//     },
//     "question": { "type": "string", minLength: 0, maxLength: 256 },
//     "answer": { "type": "string", minLength: 0, maxLength: 256 }
// },
//     "required": ["gameid", "round", "col", "row"]
// });

// GameStore.validator.addSchema({
//     "id": "/getQuestion",
//     "type": "object",
//     "properties": {
//         "gameid": { "type": "number" },
//         "round": { "type": "number" },
//         "col": { "type": "number" },
//         "row": { "type": "number" },
//     },
//     "required": ["gameid", "round", "col", "row"]
// });

// GameStore.validator.addSchema({
//     "id": "/deleteQuestion",
//     "type": "object",
//     "properties": {
//         "gameid": { "type": "number" },
//         "round": { "type": "number" },
//         "col": { "type": "number" },
//         "row": { "type": "number" },
//     },
//     "required": ["gameid", "round", "col", "row"]
// });

// GameStore.validator.addSchema({
//     "id": "/setCategory",
//     "type": "object",
//     "properties": {
//         "gameid": { "type": "number" },
//         "round": { "type": "number" },
//         "col": { "type": "number" },
//         "description": { "type": "string", minLength: 0, maxLength: 64 },
//     },
//     "required": ["gameid", "round", "col", "description"]
// });

// GameStore.validator.addSchema({
//     "id": "/getCategory",
//     "type": "object",
//     "properties": {
//         "gameid": { "type": "number" },
//         "round": { "type": "number" },
//         "col": { "type": "number" }
//     },
//     "required": ["gameid", "round", "col"]
// });

// GameStore.validator.addSchema({
//     "id": "/allCategories",
//     "type": "object",
//     "properties": {
//         "gameid": { "type": "number" },
//         "round": { "type": "number" }
//     },
//     "required": ["gameid", "round"]
// });

// GameStore.validator.addSchema({
//     "id": "/getRound",
//     "type": "object",
//     "properties": {
//         "gameid": { "type": "number" },
//         "round": { "type": "number" }
//     },
//     "required": ["gameid", "round"]
// });