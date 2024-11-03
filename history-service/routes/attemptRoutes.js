const express = require('express')
const router  = express.Router();

const { fetchAllAttempts, addAttempt, stringToBuffer, BufferToString, fetchUserAttempts, deleteAttempt, clearAllAttempts, fetchAttemptCode } = require('../controllers/attemptController')

router.route('/').get(fetchAllAttempts);

router.route('/fetchUserAttempts/:user').get(fetchUserAttempts);

router.route('/fetchAttemptCode/:docId').get(fetchAttemptCode);

router.route('/stringToBuffer').post(stringToBuffer);

router.route('/bufferToString').post(BufferToString);

router.route('/addAttempt').post(addAttempt);

router.route('/deleteAttempt').delete(deleteAttempt);

router.route('/wipe').delete(clearAllAttempts);

module.exports = router