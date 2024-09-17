/* eslint-disable react/prop-types */
import { CiSquarePlus } from "react-icons/ci";
import { useContext, useState } from 'react'

import { WorkspaceContext } from "../../../context/WorkspaceProvider";

import ConnectedUsersBar from './ConnectedUsersBar'
import FileListBar from './FileListBar'


const UpperSideBar = ({ connectedUsers, files, setFiles, handleCurrentSelectedFileRefChange, selectedUserProfile }) => {

    // useContext ==================================================================================
    const {
        currentSelectedFileIndexRef, token
    } = useContext(WorkspaceContext);

    // states of the component =====================================================================
    const [tabOpen, setTabOpen] = useState(2);
    const [isFileCreating, setIsFileCreating] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    // =============================================================================================
    const handleNewFileSubmit = (e) => {
        e.preventDefault();
        setFiles(prevFiles => {
            return [
                ...prevFiles,
                {
                    fileId: files.length + 1, filename: newFileName,
                    fileContent: `// Hello from ${newFileName}`, language: 'javascript',
                }
            ]
        });
        setNewFileName('');
        setIsFileCreating(false);
    }
    const handleDeleteFile = (e, fileId) => {
        setFiles(prevFiles => {
            return prevFiles.filter(file => file.fileId !== fileId)
        });
    }
    
    // =============================================================================================
    const ConnectedUserList = () => {
        return (<>    
            {connectedUsers.map(connectedUser => (
                <ConnectedUsersBar key={`users-${connectedUser.socketId}`}
                    userDeatils={connectedUser.userDeatils}
                    username={connectedUser.username}
                />
            ))}
        </>)
    }

    const FileList = () => (
        <div className="">
            {isFileCreating ? (
                <form onSubmit={handleNewFileSubmit}>
                    <input type="text"
                        className='max-w-[95%] bg-orange-400 rounded ml-2 p-1 text-black focus-within:outline-none'
                        value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                    />
                </form>
            ) : (
                <div className="flex justify-between px-5">
                    <p className="text-sm">All Files Listed</p>
                    <CiSquarePlus className="cursor-pointer"
                        onClick={() => setIsFileCreating(true)}
                    />
                </div>)}
            {files.map(file => (
                <FileListBar key={file.fileId}
                    file={file}
                    handleCurrentSelectedFileRefChange={handleCurrentSelectedFileRefChange}
                    handleDeleteFile={handleDeleteFile}
                    currentSelectedFileIndexRef={currentSelectedFileIndexRef}
                />
            ))}
        </div>)

    // =============================================================================================
    return (
        <div className="overflow-x-hidden overflow-y-scroll hideScrollBar w-[200px] h-[70%] flex flex-col mt-10"
        >
            <div role="tablist" className="absolute top-16 tabs tabs-bordered">
                <button
                    onClick={() => setTabOpen(1)}
                    role="tab" className={`tab ${tabOpen === 1 && 'tab-active'}`}>
                    Users
                </button>
                <button
                    onClick={() => setTabOpen(2)}
                    role="tab" className={`tab ${tabOpen === 2 && 'tab-active'}`}>
                    Files
                </button>
                

            </div>
            <div className='h-[90%]'>
                {(tabOpen === 1) ? ( <>{ConnectedUserList()}</> ) : (<>{FileList()}</>) }
            
            </div>
        </div>
    )
}

export default UpperSideBar