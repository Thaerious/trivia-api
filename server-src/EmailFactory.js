import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import { loadTemplate } from "@thaerious/utility";
import CONST from "./constants.js";
import Path from "path";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

class Email {
    constructor() {
        this.msg = {
            to: 'frar.test@gmail.com',
            from: 'ed@frar.ca',
            subject: 'Confirm your email address with Famous Trivia.',
            text: 'and easy to do anywhere, even with Node.js',
            html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        }
    }

    async send() {        
        await sgMail.send(this.msg);
    }
}

class EmailFactory {
    confirmation(destination, confirmationURL) {
        const literals = {
            home: CONST.URL.HOME,
            link: confirmationURL
        }
        console.log(literals);
        const email = new Email();
        email.msg.to = destination;
        email.msg.html = loadTemplate(CONST.TEMPLATES.CONFIRMATION + ".html", literals);
        email.msg.text = loadTemplate(CONST.TEMPLATES.CONFIRMATION + ".txt", literals);
        return email;
    }
}

export { EmailFactory as default, Email }