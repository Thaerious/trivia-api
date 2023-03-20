import jsonschema from "jsonschema";

const v = new jsonschema.Validator();

v.addSchema({
    "id": "/listGames",
    "type": "object",
    "properties": {
        "username": { "type": "string", minLength: 1, maxLength: 32 }
    },
    "required": ["username"]
});

const o = { gamename: "abdul's game" };
const s = { '$ref': 'listGames' };

const x = v.validate(o, s);

const z = x.errors.map(x => x.stack).join("\n");
console.log(z);
console.log(x);
console.log(x.valid);