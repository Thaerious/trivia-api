import GameModel from "../server-src/GameModel.js";

// const validate = GameModel.validate({
//     "username": "ed",
//     "gameid" : 1
// }, "/new");

// console.log("valid", validate.valid);
// if (!validate.valid) console.log("\n\n", validate);

// GameModel.$drop();
// GameModel.$create();

const gameModel = new GameModel({
    "username": "ed",
    "gameid": 1
});

console.log(gameModel.test({ gameid : 1, username : "ed" }));

