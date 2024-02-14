import * as path from "path";

require("dotenv").config({path: path.resolve(__dirname, `../../.${process.env.NODE_ENV || "local"}.env`)});

export const CONFIG = {
    SERVER_URL: process.env.SERVER_URL,
    DATABASE: {
        type: "postgres",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + "/../**/*.entity{.ts,.js}"],
        synchronize: true
    },
    NODE_MAILER_OPTIONS: {
        transport: {
            host: process.env.MAILER_TRANSPORT_HOST,
            port: process.env.MAILER_TRANSPORT_PORT,
            secure: true,
            auth: {
                user: process.env.MAILER_TRANSPORT_USER,
                pass: process.env.MAILER_TRANSPORT_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        }
    },
    JWT_OPTIONS: {
        SECRET_KEY: process.env.JWT_SECRET_KEY,
        SIGN_OPTIONS: {
            EXPIRES_IN: process.env.JWT_EXPIRES_IN
        }
    },
    FRONTEND_SETTINGS: {
        URL: "localhost:4200",
        ENDPOINTS: {
            RESET_PASSWORD: "auth/reset-password",
            VERIFY_EMAIL: "auth/verify-email"
        }
    },
    VAPID_KEYS: {
        PUBLIC_KEY: process.env.WEB_PUSH_PUBLIC_KEY,
        PRIVATE_KEY: process.env.WEB_PUSH_PRIVATE_KEY
    },
};
