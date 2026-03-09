const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- Subdocument Schema for Comments ---
// This is not a separate model, but a schema to be embedded
// inside the BlogSchema.
const CommentSchema = new Schema({
    authorUsername: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// --- Main Blog Post Schema ---
const BlogSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    authorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorUsername: {
        type: String,
        required: true
    },
    // --- Embedded Array of Comments ---
    comments: [CommentSchema]

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Blog', BlogSchema);

