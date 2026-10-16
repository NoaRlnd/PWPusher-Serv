import mongoose, { Schema } from "mongoose";
import argon2 from "argon2";

const userSchema = new Schema(
    {

        password: {
            type: String,
            required: true,
            minLength: 8,
            maxLength: 150,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxLength: 254,
        },

        MFA: {
            type: Boolean,
            required: false,
            default: false,
        },

        MFAsecret: {
            type: String,
            required: false,
        },

        APIkey: {
            type: String,
            minLength: 40,
            maxLength: 64,
            uppercase: true,
            required: false,
            trim: true,
        }

    },

    {
        timestamps: true
    }
)

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await argon2.hash(this.password)
});

userSchema.methods.comparePassword = async function (password) {
    return await argon2.verify(this.password, password) // "this.password" = hash | "password" = plaintext
};

export const User = mongoose.model("User", userSchema)