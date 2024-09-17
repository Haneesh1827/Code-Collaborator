import { createContext, useEffect, useRef, useState } from 'react';
import { getCookie } from '../utils/authUtils/helper';

export const WorkspaceContext = createContext(null);

// state to be maintained when user enters workspace route, useRef and useState
const WorkspaceProvider = ({ children }) => {
    const token = getCookie('token');
    const socketRef = useRef(null);
    const currentSelectedFileIndexRef = useRef(0);

    // useState hook===================================================================================
    const [allMessages, setAllMessages] = useState([]);
    const [allDbFetchedMessages, setAllDbFetchedMessages] = useState([]);  
    const [files, setFiles] = useState([
        {
            fileId: 'demo', filename: 'demo',
            fileContent: '// Hello world', language: 'javascript'
        }
    ]);
    const [currentSelectedFile, setCurrentSelectedFile] = useState(files[0]);
    const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState(false);
    
    //================================================================================================
    return (
        <WorkspaceContext.Provider value={{
            socketRef, token,
            currentSelectedFileIndexRef,

            currentSelectedFile, setCurrentSelectedFile,
            allMessages, setAllMessages,
            allDbFetchedMessages, setAllDbFetchedMessages,
            files, setFiles,
            isRoomDetailsOpen, setIsRoomDetailsOpen,
        }}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export default WorkspaceProvider