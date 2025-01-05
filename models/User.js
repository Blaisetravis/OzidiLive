// models/User.js

const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

// Check if the model already exists, and use it or create a new one
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Export the User model
module.exports = User;
