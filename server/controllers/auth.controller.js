const User = require('../models/user.model.js');
const jwt = require('jsonwebtoken');

exports.signup = (req, res) => {
    const {name, email, password} = req.body;
    const bio = 'hey';
    User.findOne({email})
    .then(existinguser => {
        if(existinguser) {
            res.status(400).json({
                error: 'Account is already activated! Please SignIn'
            })
        }
        const user  = new User({name, email, password, bio});
        user.save()
        .then(result => {
            res.json({
                message: 'Signup success. Please signin now'
            })
            return;
        })
        .catch(err => {
            console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
            res.status(400).json({
                error: 'Error saving user in our databse. Try Singup again'
            });
            return;
        })
    })
    .catch(err => {
        console.err(err);
    })
}

// controller for SINGIN handle -------------------------------------------------------------
exports.signin = (req, res) => {
    const { email, password } = req.body;
    console.log('hello')
    User.findOne({ email }).then(user => {
        // check if user exists
        if (!user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            })
        }
        // if user exists, authenticate by checking password
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and Password do not match'
            })
        }
        // generate a token and send to client
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' },

        );
        const { _id, name, email, bio } = user;

        return res.json({
            token,
            user: { _id, name, email, bio }
        })
    })
}

