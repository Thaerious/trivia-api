import express from "express";
import bodyParser from "body-parser";
import handleError from "../../handleError.js";
import { isLoggedIn, getUserName } from "./200.credentials.js";
import handleResponse from "../../handleResponse.js";
import logger from "../../setupLogger.js";
import GameModel from "../../GameModel.js";

const router = express.Router();
const gameModelStore = new Map();

router.use(bodyParser.json());
router.use(`/game/:action`, async (req, res, next) => {
    try {
        if (!isLoggedIn(req)) return handleError(res, { message: "not logged in" });
        req.body.username = getUserName(req);

        switch (req.params.action) {
            case "start": {
                const gameModel = new GameModel(req.body);
                gameModelStore.set(gameModel.$data.idx, gameModel);

                handleResponse(res, {
                    data: { idx: gameModel.$data.idx }
                });
                break;
            }

            case "get": {
                const gameModel = new GameModel(req.body.idx);
                console.log(gameModel);
                handleResponse(res, {
                    data: gameModel.$data
                });
                break;
            }

            default: {
                const gameModel = gameModelStore[req.body.idx];
                gameModel[action](body);
            }
        }
    } catch (error) {
        logger.error(error);
        handleError(res, {
            message: error.message
        });
    } finally {
        res.end();
    }
});

export default router;