const { ObjectId } = require('mongodb');
const { sampleMessageData } = require('../constants/sampleData.js')
const Message = require('../models/message.model.js')



exports.pushMessagesIntoDB = async (req, res) => {
    try {
        const { allMessages } = req.body;
        if (allMessages.length <= 0) {
            return res.status(400).json({
                error: 'No messages provided in request.'
            });
        }
        await Message.insertMany(allMessages).then(result => {
            return res.status(201).json({
                message: 'Given messages inserted in DB.'
            });
        }).catch((err) => {
            console.log('MESSAGES SAVING TO MONGODB ERROR DB', err);
            return res.status(400).json({
                error: 'Error while saving messages in mongodb.'
            });
        })
    } catch (err) {
        console.log('MESSAGES SAVING TO MONGODB ERROR', err);
    }
}

exports.getAllMessages = async (req, res) => {
    try {
        const { roomCode } = req.body;
        await Message.find({ roomCode }).then((allDbFetchedMessages) => {
            return res.status(201).json(allDbFetchedMessages);
        }).catch((err) => {
            console.log('MESSAGES FETCHING FROM MONGODB ERROR DB', err);
            return res.status(400).json({
                error: 'Error while fetching messages in mongodb.'
            });
        })
    } catch (err) {
        console.log('MESSAGES FETCHING FROM MONGODB ERROR', err);
    }
}

