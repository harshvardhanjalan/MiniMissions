const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ensures no two users can have the same username
        trim: true, // Removes whitespace from both ends of a string
        minlength: 3 // Minimum length for username
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users can have the same email
        trim: true,
        lowercase: true, // Converts email to lowercase before saving
        match: [/.+@.+\..+/, 'Please fill a valid email address'] // Basic email regex validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Minimum length for password
    },
    // We can add more fields later, e.g., role, creationDate, profilePicture, etc.
}, {
    timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

// Create the User Model from the Schema
const User = mongoose.model('User', userSchema);

// Export the User Model so it can be used in other files (like server.js)
module.exports = User;