// Point d'entrée du serveur : charge la configuration, connecte la base de données et démarre Express.
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import app from "./app.js";

dotenv.config({
    path: './.env' // ../ marche pas il faut mettre qu'un point
});

const startServer = async () => {
    try {
        await connectDB();
        app.on("error", (error) => {
            console.log("erreur", error);
            throw error;
            
        });
        app.listen(process.env.PORT || 8000, () => {
            console.log(`le serv tourne sur port : ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("connexion à la BDD échouée", err)
    }
}

startServer();