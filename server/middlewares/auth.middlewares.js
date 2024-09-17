const User = require("../models/user.model");
const { expressjwt: ejwt } = require('express-jwt');

// Middleware for singin-check --------------------------------------------------------------
exports.requireSignin = ejwt({
    // user data will be available in req.auth
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
})
