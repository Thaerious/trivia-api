import Server from "./Server.js";
import ParseArgs from "@thaerious/parseargs";
import logger from "./setupLogger.js";

(async () => {
    const args = new ParseArgs().run();
    const port = args.flags["port"];
    const server = new Server();
    
    try {
        await server.init();
        server.start(port);
    } catch (err) {
        logger.error(err);
    }    
})()