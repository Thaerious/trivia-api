import Express from "express";
import sessions from "express-session";
import dotenv from "dotenv";

dotenv.config();

const router = Express.Router();
const ONE_DAY = 1000 * 60 * 60 * 24;

router.use("*", sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: ONE_DAY},
    resave: false 
}));


// router.use("*", (req, res, next) => {
//     console.log("session");
//     console.log(req.session);
//     next();
// });
export default router;
