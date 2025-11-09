import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        }, 
        email:{
            type: String,
            required: true,
            unique: true
        },
        // password is no longer required for Google users
        password: {
            type: String,
            required: false
        },
        isDeleted: { 
            type: Boolean, 
            default: false 
        }, // post commit 4
        deletedAt: { 
            type: Date, 
            default: null 
        }, // post commit 4
        // Add googleId field
        googleId: {
            type: String,
            unique: true,
            sparse: true, // Ensure uniquenness but allows null values
        },

        resetPasswordToken: {
            type: String
        },

        resetPasswordExpires: {
            type: Date
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);