import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    }, 
    createdBy : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            role: {
                type: String,
                enum: ["admin", "member"],
                default: "member",
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    joinRequests: [
        {
            user: { 
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            requestedAt: {
                type: Date,
                default: Date.now,
            },
        },
        
    ],
}, {
    timestamps: true
});

export default mongoose.model("Organization", organizationSchema);