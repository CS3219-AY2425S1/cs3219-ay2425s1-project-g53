const Attempt = require('../models/attemptModel');

const fetchAllAttempts = async (req, res) => {
    const attempts = await Attempt.find({});

    if (!attempts) {
        res.status(200).json({ "message" : "No attempts in db" })
    } else {
        res.status(200).json(attempts)
    }
}

module.exports = { fetchAllAttempts }