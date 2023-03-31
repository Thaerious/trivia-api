import ModelFactory from "@thaerious/sql-model-factory";
import CONST from "./constants.js";
import GameStore from "./GameStore.js";
import Credentials from "./Credentials.js";
import jsonschema from "jsonschema";
import OwnerValidator from "./OwnerValidator.js";
import validatorProxy from "./validatorProxy.js";

const model = {
    "gameid": `INTEGER REFERENCES ${GameStore.DIR_TABLE}(gameid)`,
    "username": `VARCHAR(32) REFERENCES ${Credentials.TABLE}(username)`,
    "current_player": `INTEGER DEFAULT 0 NOT NULL`,
    "current_round": `INTEGER DEFAULT 1 NOT NULL`,
    "state": `INTEGER DEFAULT 0 NOT NULL`,
    "players": {
        "name": `VARCHAR(32) REFERENCES ${Credentials.TABLE}(username)`,
        "score": `INTEGER DEFAULT 0 NOT NULL`
    },
    "spent": {
        "row": `INTEGER DEFAULT 0 NOT NULL`,
        "col": `INTEGER DEFAULT 0 NOT NULL`,
    }
};

class GameModel {
    static {
        GameModel.ownerValidator = new OwnerValidator();
        GameModel.validator = new jsonschema.Validator();
    }

    static validate(obj, path) {
        return this.validator.validate(obj, { '$ref': path });
    }

    constructor({ gameid, host }) {
        GameModel.validate(arguments[0], "constructor");
        return new Proxy(this, validatorProxy);
    }
}

GameModel.validator.addSchema({
    "id": "/constructor",
    "type": "object",
    "properties": {
        "username": { type: "string", format: "owner", minLength: 1, maxLength: 32 },
        "gameid": { type: "number", format: "ownedGameID" },
    },
    "required": ["username", "gameid"]
});

GameModel.validator.addSchema({
    "id": "/test",
    "type": "object",
    "properties": {
        "username": { type: "string", format: "owner", minLength: 1, maxLength: 32 },
        "gameid": { type: "number", format: "ownedGameID" },
    },
    "required": ["username", "gameid"]
});

export default new ModelFactory(CONST.DB.PRODUCTION, {verbose: console.log}).createClass(model, GameModel);

