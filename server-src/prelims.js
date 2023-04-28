import CONST from "./constants";
import ModelFactory from "@thaerious/sql-model-factory";
import Credentials from "./models/Credentials.js";
import GameModel from "./models/GameModel.js";
import GameModel from "./models/GameModel.js";

ModelFactory.dbFile = CONST.DB.PRODUCTION;
ModelFactory.option = {};
