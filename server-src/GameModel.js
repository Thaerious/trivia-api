import ModelFactory from "sql-model-factory";
import CONST from "./constants";

const model = {
    "gameid": `INTEGER REFERENCES ${GameStore.DIR_TABLE}(gameid)`,
    "host": `VARCHAR(32) REFERENCES ${Credentials.TABLE}(username)`,
    "current_player": `INTEGER DEFAULT 0 NOT NULL`,
    "current_round": `INTEGER DEFAULT 0 NOT NULL`,
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

class GameModelBase {}

export default new ModelFactory(CONST.DB.PRODUCTION).createClass(model, GameModelBase);

