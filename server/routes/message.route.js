const express = require('express');
const router = express.Router();

// import controller -----------------------------------------------
const { getAllMessages, pushMessagesIntoDB } = require('../controllers/message.controller.js');
const { requireSignin } = require('../middlewares/auth.middlewares.js');

// import validators ----------------------------------------------

router.post('/push-messages', requireSignin, pushMessagesIntoDB)
router.post('/', requireSignin, getAllMessages)

module.exports = router;