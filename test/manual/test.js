import preclean from "../extra/preclean.js";
import { CredentialsHandler } from "../../server-src/routes/enabled/200.credentials.js";
import res from "../extra/res.js";
import Credentials from "../../server-src/models/Credentials.js";

(() => {
    const credHnd = new CredentialsHandler();

    const req = {
        session: {},
        body: {
            "username": "Maja Barabal",
            "email": "maja@gmail.com",
            "password" : "supersecret"
        }
    }
    
    credHnd.register(req, res);    
    credHnd.login(req, res);

    const cred = Credentials.$load({ "username": "Maja Barabal" });     
    console.log(cred.$data);
})();