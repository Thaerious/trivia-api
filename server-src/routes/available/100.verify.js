import Express from "express";
import { OAuth2Client } from "google-auth-library";
import bodyParser from "body-parser";
import getPem from 'rsa-pem-from-mod-exp';
import crypto from "crypto";
import base64url from "base64url";

const router = Express.Router();
const CLIENT_ID = '308309471033-rtkhcbc6mpd9m49n221hmpve5vgrc80f.apps.googleusercontent.com';
const GOOGLE_URL = 'https://accounts.google.com';
const DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration';

const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
   
    const payload = ticket.getPayload();    

    if (payload.aud !== CLIENT_ID || payload.iss !== GOOGLE_URL) {
        return false;
    } else {
        return await discoveryDocument(ticket, token);    
    }
}

async function discoveryDocument(ticket, token) {
    const discoverDocument = await (await fetch(DISCOVERY_URL)).json();
    const json = await fetch(discoverDocument.jwks_uri);
    const googleKeys = (await json.json()).keys;

    const parts = token.split('.');    
    const content = [parts[0], parts[1]].join(".");
    const signature = base64url.toBase64(parts[2]);

    for (const key of googleKeys) {
        if (key.kid === ticket.envelope.kid) {            
            const modulus = key.n;
            const exponent = key.e;
            const publicKey = getPem(modulus, exponent);
            const verifier = crypto.createVerify('RSA-SHA256');
            verifier.update(content);
            const r = verifier.verify(publicKey, signature, 'base64');
            return r;
        }
    }

    return false;
}

router.use("/verify$",
    bodyParser.json(),
    async (req, res, next) => {    
        await verify(req.body.token).catch(console.error);
        res.end();
    }
);

export { router as default, verify }

//[1] https://ncona.com/2015/02/consuming-a-google-id-token-from-a-server/