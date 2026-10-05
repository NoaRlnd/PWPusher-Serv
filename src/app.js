// Configure et exporte l'application Express utilisée par le serveur.
import express from "express"

const app = express(); // crée l'app apparemment

app.use(express.json());

import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import pushRouter from './routes/push.routes.js';

app.use("/api/v1/users", userRouter);
app.use("/api/v1/posts", postRouter);


export default app;