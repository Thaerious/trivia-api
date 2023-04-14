import Express from "express";
import http from "http";
import https from "https";
import FS from "fs";
import Path from "path";
import CONST from "./constants.js";
import logger from "./setupLogger.js";
import chokidar from "chokidar";

class Server {
    async init(options) {
        options = {
            path: CONST.SERVER.PATH.ROUTES,
            watch: false,
            ...options,
        }
        
        logger.verbose("Initializing Server");
        this.app = Express();

        this.app.set(`views`, `www/views`);
        this.app.set(`view engine`, `ejs`);

        if (options.watch) this.startWatch(options.path);
        else await this.loadRoutes(options.path);
        
        return this;
    }

    start(port = CONST.SERVER.PORT, ip = CONST.SERVER.LIST_IP) {
        this.http = http.createServer(this.app);

        this.http.listen(port, ip, () => {
            logger.verbose(`<green>HTTP Listening on port ${port}</green>`);
        });

        if (CONST.SERVER.SSL_KEY && CONST.SERVER.SSL_CERT) {
            try {
                const key = FS.readFileSync(CONST.SERVER.SSL_KEY);
                const cert = FS.readFileSync(CONST.SERVER.SSL_CERT);
                this.https = https.createServer({ cert, key }, this.app);
                this.https.listen(CONST.SERVER.SSL_PORT, CONST.SERVER.LIST_IP, () => {
                    logger.log(`<green>HTTPS Listening on port ${CONST.SERVER.SSL_PORT}</green>`);
                });
            } catch (err) {
                logger.verbose(`<red>HTTPS Server Not Started.</red>`);
            }
        }

        process.on(`SIGINT`, () => this.stop());
        process.on(`SIGTERM`, () => this.stop());
        return this;
    }

    stop() {
        logger.log(`Stopping server`);
        if (this.http) this.http.close();
        if (this.https) this.https.close();
        process.exit();
    }

    async loadRoutes(path = CONST.SERVER.PATH.ROUTES) {
        if (FS.existsSync(path)) logger.verbose(`loading routes from <green>${path}</>`);

        if (!FS.existsSync(path)) {
            logger.verbose(`Route path not found: <green>${path}</green>`);
            return;
        }

        logger.verbose(`Loading routes from <green>${path}</green>`);
        const contents = FS.readdirSync(path).sort();

        for (const entry of contents) {
            const fullpath = Path.join(process.cwd(), path, entry);            
            logger.verbose(`Loading static route <green>${Path.parse(fullpath).name}</green>`);
            await this.addRoute(fullpath);            
        }
    }

    async addRoute(path) {
        const fullpath = "file:///" + Path.resolve(path);
        const { default: route } = await import(fullpath);

        try {
            this.app.use(route);
        } catch (err) {
            const parse = Path.parse(fullpath);
            throw new Error(`route ${parse.name} did not load`, { cause: err });
        }
    }
}

export default Server;
