import Server from "./Server.js";
import ParseArgs from "@thaerious/parseargs";
import Credentials from "./models/Credentials.js";
import EmailHash from "./models/EmailHash.js";
import GameModel from "./models/GameModel.js";
import GameInstance from "./models/GameInstance.js";

(async () => {
    const args = new ParseArgs().run();
    const port = args.flags["port"];
    const server = new Server();

    Credentials.createTables();
    EmailHash.createTables();
    GameModel.createTables();
    GameInstance.createTables();

    try {
        await server.init();
        server.start(port);
    } catch (err) {
        console.log(err);        
    }    
})()