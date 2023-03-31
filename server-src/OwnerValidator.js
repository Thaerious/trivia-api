import CONST from "./constants.js";
import GameStore from "./GameStore.js";
import Credentials from "./Credentials.js";
import { Validator } from "jsonschema";

/**
 * Used as a format function in jsonschema.
 * Validates userid as the owner of a game asset.
 */
export default class OwnerValidator {
    constructor() {
        this.gameStore = new GameStore(CONST.DB.PRODUCTION).create();
        this.credentials = new Credentials(CONST.DB.PRODUCTION).create();
        Validator.prototype.customFormats.owner = i => this.setOwner(i);
        Validator.prototype.customFormats.ownedGameID = i => this.gameID(i);
    }

    setOwner(owner) {
        if (this.credentials.hasUser(owner)) {
            this.owner = owner;
            return true;
        }
        return false;
    }

    gameID(gameid) {
        const gameinfo = this.gameStore.getGame({ gameid: gameid });
        console.log(gameinfo);
        return gameinfo?.username === this.owner;
    }
}
