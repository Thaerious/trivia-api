import Server from "./Server.js";
import ParseArgs from "@thaerious/parseargs";
import Credentials from "./models/Credentials.js";
import EmailHash from "./models/EmailHash.js";
import GameModel from "./models/GameModel.js";
import GameInstance from "./models/GameInstance.js";
import ModelFactory from "@thaerious/sql-model-factory";
import logger from "./setupLogger.js";

(async () => {
    const args = new ParseArgs({
        flags: [{
            long: 'port',
            default: undefined
        }]
    });
    const server = new Server();

    ModelFactory.instance.options = { verbose: logger.sql };

    Credentials.createTables();
    EmailHash.createTables();
    GameModel.createTables();
    GameInstance.createTables();

    try {
        await server.init();
        server.start(args.port);
    } catch (err) {
        console.log(err);        
    }    
})()