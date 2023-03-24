import express from "express";
import bodyParser from "body-parser";
import handleError from "../../handleError.js";
import { isLoggedIn, getUserName } from "./200.credentials.js";
import handleResponse from "../../handleResponse.js";
import GameStore from "../../GameStore.js";
import logger from "../../setupLogger.js";

const gameStore = new GameStore().create();
const router = express.Router();
router.use(bodyParser.json());

router.use(`/gamestore/:action`, async (req, res, next) => {
    try {
        if (!isLoggedIn(req)) return handleError(res, { message: "not logged in" });
        req.body.username = getUserName(req);

        /* verify the logged in user owns the gameid */
        if (req.body.gameid) {
            const gameinfo = gameStore.getGame({ gameid: req.body.gameid });
            console.log(gameinfo);
            if (gameinfo.username !== req.body.username) {
                return handleError(res, {
                    message: `game ${req.body.gameid} does not belong to user ${req.body.username}`
                });
            }
        }
 
        console.log(req.body);
        const validate = GameStore.validate(req.body, {
            '$ref': req.params.action
        });

        if (!validate.valid) {
            return handleError(res, {
                message: validate.errors.map(x => x.stack).join("\n")
            });
        }

        handleResponse(res, {
            data: gameStore[req.params.action](req.body)
        });
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