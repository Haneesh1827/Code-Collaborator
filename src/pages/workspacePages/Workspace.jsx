/* eslint-disable react/prop-types */

import { useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

import { WorkspaceContext } from '../../context/WorkspaceProvider.jsx';

// Child functional components used in workspace functional component,
import CodeEditor from './CodeEditor.jsx';
import WorksapceHeader from './WorksapceHeader.jsx';
import UpperSideBar from './SideBar/UpperSideBar.jsx';
import RoomDetails from './RoomDetails.jsx';

import ChatPage from './chatPages/ChatPage';

import { initSocket } from '../../utils/socketConn/socket.js';
import SOCKET_ACTIONS from '../../utils/socketConn/SocketActions.js';



const Workspace = () => {

// States of the Component =========================================================
    const [editorTheme, setEditorTheme] = useState('vs-dark');
    const [isChatSelected, setIsChatSelected] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [roomDetails, setRoomDetails] = useState(undefined);

// Router Dom Hooks used ================================================================
    const location = useLocation();                         //
    const reactNavigate = useNavigate();                    //
    const { roomCode } = useParams()                          //

// useContext=======================================================================
    const {
        socketRef, token,
        
        currentSelectedFile, setCurrentSelectedFile,
        allDbFetchedMessages, setAllDbFetchedMessages,
        allMessages, setAllMessages,
        files, setFiles,
        setIsRoomDetailsOpen,
        editorLanguage,
    } = useContext(WorkspaceContext);
    
// =================================================================================
    const fetchDbMessages = async () => {
        await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/messages`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: { roomCode}
        }).then(response => {
            // console.log('ALl messages GET -----------------------------')
            setAllDbFetchedMessages(response.data);
        }).catch(err => {
            // console.log('ROOM CREATE ERROR', err.response.data);
            toast.error(err.response.data.error);
        });
    }
    const pushToDbMessages = async () => {
        if (allMessages.length > 0) {
            if (allDbFetchedMessages.length > 0) {
                const isAlreayPushed = allMessages[allMessages.length - 1]._id ===
                    allDbFetchedMessages[allDbFetchedMessages.length - 1]._id;
                if (isAlreayPushed) {
                    // console.log('ALREADY PUSHED ------------------------------');
                    return;
                }
            }
            await axios({
                method: 'POST',
                url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/messages/push-messages`,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: { allMessages }
            }).then(response => {
                // console.log('ALl messages SENT -----------------------------');
                // console.log(response);
                setAllMessages([]);
                socketRef.current.emit(SOCKET_ACTIONS.MESSAGE, {
                    messageObject: {},
                    roomCode,
                    senderObject: 'null',
                });
            }).catch(err => {
                console.log('ROOM CREATE ERROR', err.response.data);
                toast.error(err.response.data.error);
            });
        }
    }
    const getAllFilesInRoom = async () => {
        await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/rooms/files`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: { roomCode }
        }).then(response => {
            // console.log('ALl FIles from room POST -----------------------------')
            setFiles(response.data.files);
            setRoomDetails(response.data);
        }).catch(err => {
            console.log('FILE FETCH ERROR FROM ROOM', err.response.data);
            toast.error(err.response.data.error);
        });
    }
    const updateFilesInRoom = async () => {
        await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/rooms/files/update`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: { roomCode, files }
        }).then(response => {
            console.log('ALl FIles upload to db POST -----------------------------')
        }).catch(err => {
            console.log('FILE UPATE DB ERROR FROM ROOM', err.response.data);
            toast.error(err.response.data.error);
        });
    }

// =================================================================================
    useEffect(() => {
        const handleErrors = (err) => {
            console.log('Socket error: ', err);
            toast.error('Socket connection failed, try again later');
            reactNavigate('/');
        }
        const initScoketClient = async () => {
            socketRef.current = await initSocket();

            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            await getAllFilesInRoom();
            await fetchDbMessages();

            console.log('Socket Connection Done')

            const userDeatils = location.state?.userDeatils;

            socketRef.current.emit(SOCKET_ACTIONS.JOIN, {
                roomCode,
                userDeatils,
            });

            //  Listening for joined event
            socketRef.current.on(SOCKET_ACTIONS.JOINED, ({ connectedUsers, username, socketId }) => {
                if (username !== location.state?.userDeatils.username) {
                    toast.success(`${username} joined the room`);
                }
                console.log(connectedUsers);
                setConnectedUsers(connectedUsers);
                /*if (files.length > 0 && files[0].fileId !== 'demo') {
                    socketRef.current.emit(SOCKET_ACTIONS.SYNC_CODE, {
                        files,
                        socketId
                    });
                }*/
            });

            socketRef.current.on(SOCKET_ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast(`${username} left the room.`, {
                    icon: 'ℹ️'
                });
                setConnectedUsers((prev) => {
                    return prev.filter(connectedUser => connectedUser.socketId !== socketId)
                })
            });

        }
        initScoketClient();
        return () => {
            socketRef.current.off(SOCKET_ACTIONS.JOINED);
            // socketRef.current.off(SOCKET_ACTIONS.CODE_CHANGE);
            socketRef.current.off(SOCKET_ACTIONS.DISCONNECTED);
            socketRef.current.disconnect();
        }
    }, []);

// =================================================================================
    const toggleIsChatSelected = () => {
        if (isChatSelected) {
            pushToDbMessages();
        }
        setIsChatSelected(prevIsChatSelected => !prevIsChatSelected);
    }
    const handleFileChange = (newFileContent) => {
        // console.log('newFileContent: ', newFileContent);
        setFiles(prevFiles => {
            const newFiles = prevFiles.map(file => {
                if (file.fileId === currentSelectedFile.fileId) {
                    // currentSelectedFileIndexRef.current = files.indexOf(file);
                    return { ...file, fileContent: newFileContent }
                } 
                else {
                    return file;
                }
            })
            if (socketRef.current) {
                socketRef.current.emit(SOCKET_ACTIONS.CODE_CHANGE, {
                    roomCode, files : newFiles, fileId: currentSelectedFile.fileId
                })
            }
            return newFiles;
        });
     
    }

    const handleFileLanguageChange = (newFileLanguage) => {
        // console.log('newFileLanguage: ', newFileLanguage);
        setCurrentSelectedFile(prevCurrentSelectedFile => {
            return { ...prevCurrentSelectedFile, language: newFileLanguage }
        })
        setFiles(prevFiles => {
            const newFiles = prevFiles.map(file => {
                if (file.fileId === currentSelectedFile.fileId) {
                    return { ...file, language: newFileLanguage }
                } else {
                    return file;
                }
            })
            if (socketRef.current) {
                socketRef.current.emit(SOCKET_ACTIONS.CODE_CHANGE, {
                    roomCode, files: newFiles, fileId: currentSelectedFile.fileId
                })
            }
            return newFiles;
        });
        if (socketRef.current) {
            socketRef.current.emit(SOCKET_ACTIONS.CODE_CHANGE, {
                roomCode, files, fileId: currentSelectedFile.fileId
            })
        }
    }
    const handleCurrentSelectedFileRefChange = (file) => {
        setCurrentSelectedFile(file);
    }
    const handleCopyRoomCode = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
            toast.success('ROOM ID has been copied to your clipboard')
        } catch (err) {
            toast.error('Could not copy the ROOM ID')
            console.error(err);
        }
    }
    const handleLeaveRoom = async () => {
    
        await updateFilesInRoom();
        await pushToDbMessages();
        
        reactNavigate('/');
    }

// =================================================================================
    if (!location.state) {
        return <Navigate to='/room' />
    }

    
    return (
        <div className='##mainwrap h-screen flex p-2 overflow-y-hidden relative'>
            {/* the sidebar div contains RoomDetails, UpperSideBar, TodoPage */}
            <div className="h-full flex flex-col justify-between">
                {/*RoomDetails and UserSideBar(the top part)*/}
                <div className="h-[60%]">
                    <button className="p-1 w-full"
                        onClick={() => setIsRoomDetailsOpen(true)}>
                        <h2 className=' bg-[#153448] py-3 text-xl text-white font-mono flex justify-center items-center'>
                            {roomDetails ? roomDetails.name : 'Synchrotek'}
                        </h2>
                    </button>
                    {/* ----------------------------------- */}
                    <UpperSideBar
                        connectedUsers={connectedUsers}
                        files={files}
                        setFiles={setFiles}
                        handleCurrentSelectedFileRefChange={handleCurrentSelectedFileRefChange}
                    />
                </div>

                
                {roomDetails && ( <RoomDetails roomDetails={roomDetails} /> ) } {/*Component opens when clicked*/}

                {/* div element encompansiing the lower part of the sidebar */}
                <div className='flex flex-col justify-end w-full gap-4 z-20 h-[40%] '>
                    <button className='btn btn-accent font-semibold'
                        onClick={handleCopyRoomCode}
                    >Copy ROOM ID</button>

                    <button className='btn btn-outline btn-warning font-semibold'
                        onClick={handleLeaveRoom}
                    >LEAVE</button>
                </div>
            </div>

            {/* this div has WorkspaceHeader, CodeEditor, ChatPage as child components*/}
            <div className="w-full h-screen p-0 my-0 ml-3 overflow-x-hidden">
                <WorksapceHeader
                    setEditorTheme={setEditorTheme}
                    handleFileLanguageChange={handleFileLanguageChange}
                    isChatSelected={isChatSelected}
                    toggleIsChatSelected={toggleIsChatSelected}
                    
                />

                {/* CodeEditor and Chatpage*/}
                <div className='h-[85%] relative'>
                    <ChatPage
                        isChatSelected={isChatSelected}
                        roomCode={roomCode}
                        fetchDbMessages={fetchDbMessages}
                    />
                    <CodeEditor
                        socketRef={socketRef}
                        setFiles={setFiles}
                        editorLanguage={editorLanguage} editorTheme={editorTheme}
                        handleCurrentSelectedFileRefChange={handleCurrentSelectedFileRefChange}
                        handleFileChange={handleFileChange}
                    />
                </div>

            </div>
        </div>
    )
}

export default Workspace