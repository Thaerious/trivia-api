import GameModelFactory from "../server-src/models/GameModel.js";

const GameModel = GameModelFactory("./db/deleteme.db");



const gameModel = new GameModel({
    "username": "ed",
    "gameid": 1
});

console.log(gameModel.test({ gameid : 1, username : "ed" }));

