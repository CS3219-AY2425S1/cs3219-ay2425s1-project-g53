const Attempt = require('../models/attemptModel');

const fetchAllAttempts = async (req, res) => {
    const attempts = await Attempt.find({});

    if (!attempts) {
        res.status(200).json({ "message" : "No attempts in db" })
    } else {
        res.status(200).json(attempts)
    }
}

const addAttempt = async (req, res) => {
    const { user1, user2, problem, start, end, code } = req.body;

    if (!user1 || !user2 || !problem || !code ) {
        return res.status(400).json({ "message" : "Please provide all required fields."});
    }

    try {
        const attempt = await Attempt.create({
            users: [user1, user2],
            problem,
            attemptStart: start ? new Date(start) : undefined,
            attemptEnd: end ? new Date(end) : undefined,
            attemptCode: Buffer.from(code)
        })

        res.status(201).json(attempt);
    } catch (err) {
        console.log("error adding new attempt");
        res.status(500).json({ "message" : "Unable to add new attempt" });
    }
}

const fetchUserAttempts = async (req, res) => {
    const { user } = req.params;

    try {
        const attempts = await Attempt.find({ users: user });

        if (attempts.length == 0) {
            return res.status(404).json({ "message" : "No attempts found for user"});
        }
    
        const parsedAttempts = attempts.map(attempt => ({
            id: attempt._id,
            users: attempt.users,
            problem: attempt.problem,
            attemptStart: attempt.attemptStart,
            attemptEnd: attempt.attemptEnd,
            attemptCode: attempt.attemptCode.toString(),
            createdAt: attempt.createdAt
        }));
    
        res.status(200).json(parsedAttempts);
    } catch (err) {
        console.log("Error retrieving attempts", err);
        res.status(500).json({ "message" : "Unable to retrieve attempts."});
    }
}

const fetchAttemptCode = async (req, res) => {
    const { docId } = req.params;

    try {
        const attempt = await Attempt.findById(docId).select('attemptCode');

        if (!attempt) {
            return res.status(404).json({ "message": "Attempt not found with id " + docId });
        }

        const attemptCode = attempt.attemptCode.toString();

        res.status(201).json(attemptCode);
    } catch (err) {
        console.log("Error trying to retrieve document details", err);
        res.status(500).json({ "message" : "Unable to retrieve attempt with id " + docId });
    }
}

const clearAllAttempts = async (req, res) => {
    try {
        const deleteAll = await Attempt.deleteMany({});

        res.status(200).json({ "message" : "All attempt documents deleted. "});
    } catch (err) {
        console.log("Error deleting all attempts:", err);
        res.status(500).json({ "message" : "Unable to delete all documents. Please try again later." });
    }
}

// Used for debugging
const deleteAttempt = async (req, res) => {
    const { attemptId } = req.body;

    try {
        const deleteDoc = await Attempt.deleteOne({ _id: attemptId });

        if (!deleteDoc) {
            return res.status(404).json({ "message" : "document not found"});
        }

        res.status(200).json({ "message" : "document deleted successfully" });
    } catch (err) {
        console.log("Error trying to delete attempt", err);
        res.status(500).json({ "message" : "Unable to delete attempt. Please try again. "});
    }
}

// Debugging function
const stringToBuffer = async (req, res) => {
    const { code } = req.body;
    var temp = Buffer.from(code);
    console.log(temp);
    console.log(temp.toString());

    return res.status(201).json(temp);
}

// Debugging function
const BufferToString = async (req, res) => {
    const { buffer } = req.body;

    return res.status(201).json(buffer.toString());
}

module.exports = { fetchAllAttempts, addAttempt, stringToBuffer, BufferToString, fetchUserAttempts, fetchAttemptCode, deleteAttempt, clearAllAttempts }