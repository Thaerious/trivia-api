import assert from "assert";
import CONST from "../server-src/constants.js";

// describe("check test .env was loaded", function () {
//     it("has the env var TEST=true", function () {
//         assert.strictEqual(
//             process.env['TEST'],
//             "true"
//         );
//     });
// });

console.log(process.pid);
console.log(process.env.TEST);

let a = 3;

while (1) {
    a = a * 13 % 7;
}