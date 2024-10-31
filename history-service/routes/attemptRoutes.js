const express = require('express')
const router  = express.Router();

const { fetchAllAttempts } = require('../controllers/attemptController')

router.route('/').get(fetchAllAttempts);

module.exports = router