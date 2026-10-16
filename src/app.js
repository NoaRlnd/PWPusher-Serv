// Configure et exporte l'application Express utilisée par le serveur.
import express, { urlencoded } from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import { json } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config({
    path: './.env' // ../ marche pas il faut mettre qu'un point
});

const app = express(); // crée l'app apparemment
const corsOptions = {
    origin: ["http://localhost:3001"],
    credentials: true,
}

app.use(json({ limit: "100mb" }));
app.use(urlencoded({ limit: "100mb", extended: true }));
app.use(cors(corsOptions));
app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000 * 15 } //ù penser à ajouter dans l'objet "secure: true" et "sameSite: "strict"" pour forcer le https et éviter les attaques CSRF
    }));

app.use(cookieParser(process.env.COOKIE_SIGNING))
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import pushRouter from './routes/push.routes.js';
import mfaRouter from './routes/mfa.routes.js';

app.use("/api/v1/mfa", mfaRouter)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/push", pushRouter);

export default app;