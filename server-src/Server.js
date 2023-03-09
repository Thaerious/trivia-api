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
        
        logger.verbose("Initialize Server");
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
            logger.standard(`Listening on port ${port}`);
        });

        if (CONST.SERVER.SSL_KEY && CONST.SERVER.SSL_CERT) {
            try {
                const key = FS.readFileSync(CONST.SERVER.SSL_KEY);
                const cert = FS.readFileSync(CONST.SERVER.SSL_CERT);
                this.https = https.createServer({ cert, key }, this.app);
                this.https.listen(CONST.SERVER.SSL_PORT, CONST.SERVER.LIST_IP, () => {
                    logger.standard(`HTTPS Listening on port ${CONST.SERVER.SSL_PORT}`);
                });
            } catch (err) {
                console.log(err);
                logger.standard(`HTTPS Server Not Started.`);
            }
        }

        process.on(`SIGINT`, () => this.stop());
        process.on(`SIGTERM`, () => this.stop());
        return this;
    }

    stop() {
        logger.standard(`Stopping server`);
        if (this.http) this.http.close();
        if (this.https) this.https.close();
        process.exit();
    }

    async loadRoutes(path = CONST.SERVER.PATH.ROUTES) {
        logger.verbose(`loading routes from ${path} ${FS.existsSync(path)}`);
        if (!FS.existsSync(path)) return;

        const contents = FS.readdirSync(path).sort();

        for (const entry of contents) {
            const fullpath = Path.join(process.cwd(), path, entry);
            logger.verbose(`static route ${fullpath}`);
            await this.addRoute(fullpath);
        }
    }

    async addRoute(path) {
        const fullpath = Path.resolve(path);
        const { default: route } = await import(fullpath);

        try {
            this.app.use(route);
        } catch (err) {
            const parse = Path.parse(fullpath);
            throw new Error(`route ${parse.name} did not load`, { cause: err });
        }
    }

    startWatch(path = CONST.SERVER.PATH.ROUTES) {
        this.watcher = chokidar.watch(path, { ignored: /^\./, persistent: true });

        this.watcher
            .on('add', (path) => {
                logger.verbose(`watch route ${path}`);
                Path.resolve(path)
                this.addRoute(path);
            })
            .on('change',  (path) =>{ console.log('File', path, 'has been changed'); })
            .on('unlink',  (path)=> { console.log('File', path, 'has been removed'); })
            .on('error',  (error) =>{ console.error('Error happened', error); })
    }
}

export default Server;
