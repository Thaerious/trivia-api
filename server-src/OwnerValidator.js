import CONST from "./constants.js";
import GameStore from "./models/GameStore.js";
import Credentials from "./models/Credentials.js";
import { Validator } from "jsonschema";
import logger from "./setupLogger.js";

GameStore.$createTables(CONST.DB.PRODUCTION, {verbose: logger.sql}); 
Credentials.$createTables(CONST.DB.PRODUCTION, {verbose: logger.sql});

/**
 * Used as a format function in jsonschema.
 * Validates userid as the owner of a game asset.
 */
export default class OwnerValidator {
    constructor() {
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
