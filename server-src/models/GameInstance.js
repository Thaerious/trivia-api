import ModelFactory from "@thaerious/sql-model-factory";
import CONST from "../constants.js";

const factory = ModelFactory.instance;
factory.dbFile = CONST.DB.PRODUCTION;

factory.createClasses({
   "GameInstance": {
        "model": `@GameModel NOT NULL`,
        "owner": `@Credentials NOT NULL`,
        "current_player": `INTEGER DEFAULT 0 NOT NULL`,
        "current_round": `INTEGER DEFAULT 1 NOT NULL`,
        "state": `INTEGER DEFAULT 0 NOT NULL`,
        "players": [{
            "cred": `@Credentials`,
            "score": `INTEGER DEFAULT 0 NOT NULL`
        }],
        "spent": [{
            "row": `INTEGER DEFAULT 0 NOT NULL`,
            "col": `INTEGER DEFAULT 0 NOT NULL`,
        }]
    }
});

// GameInstance.validator.addSchema({
//     "id": "/constructor",
//     "type": "object",
//     "properties": {
//         "username": { type: "string", format: "owner", minLength: 1, maxLength: 32 },
//         "gameid": { type: "number", format: "ownedGameID" },
//     },
//     "required": ["username", "gameid"]
// });

// GameInstance.validator.addSchema({
//     "id": "/test",
//     "type": "object",
//     "properties": {
//         "username": { type: "string", format: "owner", minLength: 1, maxLength: 32 },
//         "gameid": { type: "number", format: "ownedGameID" },
//     },
//     "required": ["username", "gameid"]
// });

export default factory.classes.GameInstance;

