import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import argon2 from "argon2";

const userSchema = new Schema(
    {

        password: {
            type: String,
            required: true,
            minLength: 8,
            maxLength: 50,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        MFA: {
            type: Boolean,
            required: false,
        },

        twoFAsecret: {
            type: String,
            required: false,
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
    return await bcrypt.compare(this.password, password) // "this.password" = plaintext | "password" = hash
};

export const User = mongoose.model("User", userSchema)