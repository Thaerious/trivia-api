import Logger, { colorize } from "@thaerious/logger";
import CONST from "./constants.js";
import { mkdirif } from "@thaerious/utility";
import FS from "fs";
import ParseArgs from "@thaerious/parseargs"

/**
 * date : Date object
 * dateArray : Date array, specifies formatting
 * seperator : Seperator
 */
function joinDate(date, dateArray, seperator) {
    function format(m) {
        let f = new Intl.DateTimeFormat('en', m);
        return f.format(date);
    }
    return dateArray.map(format).join(seperator);
}

function logFilename() {
    const dateArray = [{ year: 'numeric' }, { month: 'short' }, { day: 'numeric' }];
    const dateString = joinDate(new Date, dateArray, '_');
    return mkdirif(CONST.SERVER.PATH.LOGS, dateString + ".txt");
}

const options = {
    flags: [
        {
            long: `verbose`,
            short: `v`,
            type: `boolean`
        }
    ]
};

const args = new ParseArgs().config(options).run();
const logger = new Logger();

const fileLogger = (value) => FS.appendFileSync(logFilename(), new Date().toLocaleTimeString() + " " + value + "\n");

logger.standard.enabled = true;
logger.error.enabled = true;
logger.log.enabled = true;
logger.verbose.enabled = false;
logger.veryverbose.enabled = false;

if (args.flags["verbose"]) logger.verbose.enabled = true;
if (args.tally["verbose"] >= 2) logger.veryverbose.enabled = true;

logger.error.handlers = [
    (error) => {
        if (error instanceof Error) {
            return `<red>ERROR ${error.message}</red>`;
        } else {
            return `<red>ERROR ${error}</red>`;
        }
    },
    colorize,
    console
];

// FS.appendFileSync(logFilename(), `${new Date().toLocaleTimeString()}  \n`);
// FS.appendFileSync(logFilename(), error.stack);


logger.log.handlers = [
    fileLogger,
    console
];

logger.verbose.handlers = [
    colorize,
    console
];

logger.veryverbose.handlers = [
    colorize,
    console
];

export default logger;