// Établit la connexion entre l'application et la base de données MongoDB.
import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect
        (`${process.env.CONNECTION_STRING}`)
        console.log(`\n connexion réussie : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("connexion échouée", error);
        process.exit(1)
    }
}

export default connectDB;