const express = require('express');
const router = express.Router();

// import controller
const {signup, signin} = require('../controllers/auth.controller.js');

const {requestLogger} = require('../middlewares/requestlogger.js')
// import validators
const {userSignupValidator, userSigninValidator} = require('../validators/auth.validator.js');

const { runValidation } = require('../validators/index.validator.js');

router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/signin', userSigninValidator, runValidation, signin);



module.exports = router;