const SOCKET_ACTIONS = require('./SocketActions.js');

const socketCommunication1 = (io) => {
    const sokcetIdToUsersMap = {};
    const roomCodeToCodeMap = {};

    const getUsersInRoom = async (roomCode, io) => {
        const socketList = await io.in(roomCode).allSockets();
        const userList = [];
        socketList.forEach(each => {
            (each in sokcetIdToUsersMap) &&
                userList.push(sokcetIdToUsersMap[each].username)
        });

        return userList;
    };

    const updateUserListAndCodeMap = async (io, socket, roomCode) => {
        socket.in(roomCode).emit(SOCKET_ACTIONS.DISCONNECTED, {
            username: sokcetIdToUsersMap[socket.id]
        })

        // update the user list
        delete sokcetIdToUsersMap[socket.id];

        const userList = await getUsersInRoom(roomCode, io);
        socket.in(roomCode).emit(SOCKET_ACTIONS.CLIENTLIST_UPDATE, { userList });

        userList.length === 0 && delete roomCodeToCodeMap[roomCode];
    }

    io.on('connection', (socket) => {
        socket.on(SOCKET_ACTIONS.JOIN, async ({ roomCode, username }) => {
            sokcetIdToUsersMap[socket.id] = { username };
            socket.join(roomCode);

            const userList = await getUsersInRoom(roomCode, io);

            // for other user, update the client list ---------------
            socket.in(roomCode).emit(SOCKET_ACTIONS.CLIENTLIST_UPDATE, { userList });

            // for other user, update the client list ---------------
            io.to(socket.id).emit(SOCKET_ACTIONS.CLIENTLIST_UPDATE, { userList });

            // send the latest code changes to this user 
            // when joined to existing room -------------------------
            if (roomCode in roomCodeToCodeMap) {
                io.to(socket.id).emit(SOCKET_ACTIONS.SYNC_CODE, {
                    files: roomCodeToCodeMap[roomCode].files // change here
                })
            }

            // alert other users in room that new user joined -------
            socket.in(roomCode).emit(SOCKET_ACTIONS.JOINED, { username });
        });

        socket.on(SOCKET_ACTIONS.CODE_CHANGE, ({ roomCode, files }) => {
            if (roomCode in roomCodeToCodeMap) {
                roomCodeToCodeMap[roomCode]['files'] = files
            } else {
                roomCodeToCodeMap[roomCode] = { files }
            }
        });

        socket.on(SOCKET_ACTIONS.SYNC_CODE, ({ roomCode }) => {
            if (roomCode in roomCodeToCodeMap) {
                socket.in(roomCode).emit(SOCKET_ACTIONS.CODE_CHANGE, {
                    files: roomCodeToCodeMap[roomCode].files
                })
            }
        });

        socket.on('disconnecting', (reason) => {
            socket.rooms.forEach(eachRoom => {
                if (eachRoom in roomCodeToCodeMap) {
                    updateUserListAndCodeMap(io, socket, eachRoom);
                }
            })
        });

        socket.on('disconnect', () => {
            console.log(`user disconnected - ${socket.id}`);
        });
    });
};

module.exports = socketCommunication1;