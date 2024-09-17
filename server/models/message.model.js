const mongoose = require('mongoose');
const crypto = require('crypto');

// Message schema ----------------------------------------
const messageSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true
    },
    sender: {
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
    },
    content: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);