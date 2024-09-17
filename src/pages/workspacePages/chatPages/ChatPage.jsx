/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import { FiSend } from "react-icons/fi";
import ReactScrollToBottom from 'react-scroll-to-bottom';

import { WorkspaceContext } from "../../../context/WorkspaceProvider";

import MessageComponent from './MessageComponent'

import SOCKET_ACTIONS from "../../../utils/socketConn/SocketActions";


const ChatPage = ({ isChatSelected, roomCode, fetchDbMessages }) => {
    // useContext -----------------------------------------------------------------------------------------
    const {
        socketRef, allMessages, allDbFetchedMessages, setAllMessages
    } = useContext(WorkspaceContext);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    // States of the Component -----------------------------------------------------------------------------
    const [senderObject, setSenderObject] = useState()
    const [currentMessageInput, setCurrentMessageInput] = useState(
        {
            content: "",
            sender: {
                _id: currentUser._id,
                name: currentUser.name,
            },
            roomCode: roomCode,
            createdAt: "",
        }
    );

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(SOCKET_ACTIONS.SEND_MESSAGE, ({messageObject, senderObject}) => {

                if (messageObject.roomCode) {
                    setAllMessages(prevAllMessages => {
                        return [...prevAllMessages, messageObject]
                    });
                    setSenderObject(senderObject);
                } else {
                    setAllMessages([]);
                    fetchDbMessages();
                }

            })
        } else {
            console.log('Socket code-sync error! !!!!!!!!!');
        }
        return () => {
            socketRef.current.off(SOCKET_ACTIONS.SEND_MESSAGE);
        }
    }, [socketRef.current])

    const sendMessage = async (e) => {
        e.preventDefault();

        const messageObject = {
            ...currentMessageInput,
            createdAt: new Date().toISOString(),
        }
        if (socketRef.current) {
            socketRef.current.emit(SOCKET_ACTIONS.MESSAGE, {
                messageObject,
                roomCode,
                senderObject: currentUser,
            });
        }
        setCurrentMessageInput(prevMessageInput => {
            return { ...prevMessageInput, content: '' }
        });
    }

    const handleInputChange = (e) => {
        setCurrentMessageInput(prevMessageInput => {
            return { ...prevMessageInput, content: e.target.value }
        });
    }

    return (
    //the div is shown only when isChatSelected is true
    <div className={`absolute z-20 w-[50%] h-[90%] transition-all
        ${isChatSelected ? 'right-0' : '-right-[110%]'}`}>
            
        <ReactScrollToBottom className="bg-blue-300 rounded-lg w-full h-[100%] text-black overflow-y-scroll hideScrollBar">
            <div >
                {allDbFetchedMessages.map((msg) => (
                    <MessageComponent key={`${msg.createdAt}${msg.content}`}
                        message={msg} currentUserId={currentUser._id}
                        senderObject={senderObject}
                    />
                ))}
                {allMessages.map((msg) => (
                    <MessageComponent key={`${msg.createdAt}${msg.content}`}
                        message={msg} currentUserId={currentUser._id}
                        senderObject={senderObject}
                    />
                ))}
            </div>
        </ReactScrollToBottom>
        <form className='h-[10%] flex w-full items-center px-2 my-2'
            encType="multipart/form-data">

            {/*<label htmlFor='fileInput' className='btn hover:bg-slate-700'>
                <ImAttachment />
            </label>
            
            <input type="file" className='hidden' id='fileInput'
                onChange={e => setSelectedFileData(e.target.files[0])}/>*/}
            
            <input type='text'
                className='input w-full focus-within:outline-none'
                placeholder="Type Message here..."
                
                value={currentMessageInput.content}
                onChange={handleInputChange}/>

            <button className={`btn text-white hover:bg-slate-700 hover:text-xl transition-all`} onClick={sendMessage}>
                    <FiSend />
            </button>
        </form>
    </div>
    )
}

export default ChatPage