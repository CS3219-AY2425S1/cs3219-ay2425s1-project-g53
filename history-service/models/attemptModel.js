const mongoose = require('mongoose');

const AttemptSchema = mongoose.Schema({
    users: [
        { type: String, required: true }
    ],
    problem: { type: String, required: true },
    attemptStart: { type: Date },
    attemptEnd: { type: Date },
    attemptCode : { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attempt', AttemptSchema);