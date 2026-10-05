// Configure et exporte l'application Express utilisée par le serveur.
import express, { urlencoded } from "express";
import connection from "mongoose";
import session from "express-session";
import passport from "passport";
import cors from "cors";

const app = express(); // crée l'app apparemment
const corsOptions = {
    origin: ["http://localhost:3001"],
    credentials: true,
}

app.use(cors(corsOptions));
app.use(session({
        secret: process.env.SESSION_SECRET || "secret",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60000 * 15 }
    }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(json({ limit: "100mb" }));
app.use(urlencoded({ limit: "100mb", extended: true }));

import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import pushRouter from './routes/push.routes.js';

// router /api/v1/auth
// router /api/v1/mfa
app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/push", pushRouter);


export default app;