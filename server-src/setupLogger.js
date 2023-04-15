import Logger, { colorize, position } from "@thaerious/logger";
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

function fileLog(value) {
    if (value instanceof Error) {
        FS.appendFileSync(logFilename(), `${new Date().toLocaleTimeString()} ERROR ${value.message} \n`);
        FS.appendFileSync(logFilename(), value.stack);
    } else {
        FS.appendFileSync(logFilename(), new Date().toLocaleTimeString() + " " + value + "\n");
    }
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

logger.error.enabled = true;
logger.log.enabled = true;
logger.sql.enabled = true;
logger.verbose.enabled = args.flags["verbose"];
logger.veryverbose.enabled = args.tally["verbose"] >= 2;

logger.error.handlers = [
    fileLog,
    console
]

logger.log.handlers = [
    fileLog,
    console
]

logger.verbose.handlers = [
    position,
    colorize,
    console
];

logger.veryverbose.handlers = [
    colorize,
    console
]

logger.sql.handlers = [
    v => {
        return v.replace(/([ \n][a-z]+[ \n])/g, "<yellow>$1</yellow>")
        .replace(/<yellow>undefined<\/yellow>/g, "<red>undefined</red>")
    },
    colorize,
    console
]

// const stdout = console.log;
// console.log = (s) => {
//     stdout(`[con] ${position(s)}`);
// }

export default logger;