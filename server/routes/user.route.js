const express = require('express');
const router = express.Router();

// import controller
const { requireSignin } = require('../middlewares/auth.middlewares.js')
const { readUser, updateUser, getRoomsJoined, addRoomsJoined, deleteRoomsJoined} = require('../controllers/user.controller.js');
// import validators

router.get('/user/:id', requireSignin, readUser);
router.put('/user/update', requireSignin, updateUser);

//to implement now

router.get('/user/:id/roomsJoined',requireSignin, getRoomsJoined);

router.post('/user/:id/roomsJoined/add', requireSignin, addRoomsJoined);

router.delete('/user/:id/roomsJoined/delete', requireSignin, deleteRoomsJoined);

module.exports = router;
