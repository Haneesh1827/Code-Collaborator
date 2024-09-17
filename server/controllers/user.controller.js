const User = require('../models/user.model.js');
const Room = require('../models/room.model.js');
exports.readUser = (req, res) => {
    const userId = req.params.id;
    User.findById(userId).then((user) => {
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }).then((user) => {
        user.hashed_password = undefined;
        user.salt = undefined;
        console.dir(user);
        res.json(user);
    }).catch(err => {
        return res.status(400).json({
            error: err.message
        })
    })
}

exports.updateUser = (req, res) => {
    const { name, bio, password } = req.body;
    User.findById(req.auth._id).then((user) => {
        if (!user) {
            console.log('User not found');
            throw new Error('User not found');
        }
        if (!name) {
            console.log('Name is required with min of 3 characters.');
            throw new Error('Name is required');
        }
        user.name = name;
        user.bio = bio;
        
        // if user exists authenticate
        if (!user.authenticate(password)) {
            throw new Error('Incorrect Password. Try Again');
        }
        return user;
    }).then((user) => {
        user.save().then(updatedUser => {
            // updatedUser.hashed_password = undefined;
            // updatedUser.salt = undefined;
            res.json(updatedUser);
        }).catch((err) => {
            console.log('USER UPDATE ERROR', err);
            return res.status(400).json({
                error: 'User update failed'
            })
        })
    }).catch(err => {
        return res.status(400).json({
            error: err.message
        })
    });
}

exports.addRoomsJoined= (req, res) => {
    // Extract userId from request params and roomCode from request body
    const { id } = req.params;  // userId from URL params
    const { roomCode } = req.body;  // roomCode from request body

    // Find the room with the matching roomCode
    Room.findOne({ roomCode })
        .then((room) => {
            if (!room) {
                // If room doesn't exist, send a 404 error
                return res.status(404).json({ error: 'Room not found' });
            }

            // Find the user by ID
            User.findById(id)
                .then((user) => {
                    if (!user) {
                        // If user doesn't exist, send a 404 error
                        return res.status(404).json({ error: 'User not found' });
                    }

                    // Check if the room is already in the user's roomsJoined array
                    const roomAlreadyJoined = user.roomsJoined.includes(room._id);
                    
                    if (roomAlreadyJoined) {
                        // If room is already joined, send a 400 response
                        return res.status(400).json({ message: 'Room already joined' });
                    }

                    // Add room to roomsJoined array if not already present
                    user.roomsJoined.push(room._id);

                    // Save the updated user document
                    user.save()
                        .then(() => {
                            return res.status(200).json({ message: 'Room joined successfully' });
                        })
                        .catch((err) => {
                            return res.status(500).json({ error: 'Error saving user document', details: err });
                        });
                })
                .catch((err) => {
                    return res.status(500).json({ error: 'Error finding user', details: err });
                });
        })
        .catch((err) => {
            return res.status(500).json({ error: 'Error finding room', details: err });
        });
};




exports.deleteRoomsJoined = (req, res) => {
    const {id} = req.params;
    const {_id} = req.body;

    User.findById(id)
    .then(user => {
        user.roomsJoined = user.roomsJoined.filter(item => item.toString() !== _id.toString()); 
        return user.save();
    })
    .then(user => {
        console.log('Deleted room from the roomsJoined array');
        res.json({message : 'Room deleted from roomsJoined array'});
    })
    .catch(err => {
        
        res.status(500).json({error : 'Server error'})
    })
}

exports.getRoomsJoined = (req, res) => {
    const {id} = req.params;
    console.log(id);
    User.findById(id).populate('roomsJoined')
    .then((user) => {
        if(!user){
            res.status(404).json({error: 'User Not Found'})
            return;
        }
        res.json(user.roomsJoined);
    })
    .catch(err => {
        res.status(500).json({error: 'Server error'})
    })
}