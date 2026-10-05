import mongoose, { Schema } from "mongoose";

const pushSchema = new Schema(
    {

        payload: {
            type: String,
        },

        passphrase: {
            type: String,
            minLength: 1,
            maxLength: 150,
        },

        expiration: {
            type: Number,
            required: true,
            minLength: 0,
            maxLength: 18,
        },

        maxViews: {
            type: Number,
            required: true,
            minLength: 0,
            maxLength: 100,
        },

        files: {
            type: String,       // chaine de charactère en base64 de la part du client (convertie plus tard en fichier)
        }

    },

    {
        timestamps: true
    }
)

export const Push = mongoose.model("Push", pushSchema)