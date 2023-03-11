import dotenv from "dotenv";
import Path from "path";
dotenv.config();

export default {
    SERVER: {
        PORT: `${process.env.PORT || 8080}`,
        SSL_PORT: `${process.env.SSL_PORT || 443}`,
        LIST_IP: `${process.env.LIST_IP || '0.0.0.0'}`,
        SSL_KEY: `${process.env.SSL_KEY || '.cert/server.key'}`,
        SSL_CERT: `${process.env.SSL_CERT || '.cert/server.cert'}`,
        PATH: {
            ROUTES: "server-src/routes/enabled",
            LOGS: "./logs"
        }
    },
    URL: {
        HOME: "http://127.0.0.1:8080",
        CONFIRMATON: "http://127.0.0.1:8080/confirmation",
        PORTAL: process.env.PORTAL_URL,
    },
    TEMPLATES: {
        CONFIRMATION: Path.join("emails", "confirmation")
    },
    DB: {
        PRODUCTION: "db/credentials.db",
        SALT_ITERATIONS: 8,
        TABLE: {
            EMAIL_CONF: "email_confirmation"
        },        
    },
    STATUS: {
        EXCEPTION: "exception",
        SUCCESS: "success",
        REJECTED: "rejected"
    }
};


