import { useState } from 'react'
import { IoMdArrowRoundBack } from "react-icons/io";
import { v4 as uuidV4, validate } from 'uuid'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css';
import Layout from './Layout'
import { getCookie } from '../utils/authUtils/helper'

const RoomSelect = () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const token = getCookie('token');

    const location = useLocation();
    const navigate = useNavigate();
    
    const [isCreatingNewRoom, setIsCreatingNewRoom] = useState(false);
    const [values, setValues] = useState({
        roomCode: location.state?.roomCode || '',
        roomName: '',
        roomDesc: '',
        username: currentUser.name,
        loading: false
    });

    //Handlers -------------------------------------------------------------------------- 
    const handleChange = (e, value) => {
        setValues({
            ...values,
            [value]: e.target.value
        });
    }

    const generateNewRoomCode = (e) => {
        e.preventDefault();
        const newRoomCode = uuidV4();
        setValues({ ...values, roomCode: newRoomCode });
        toast.success('New roomCode creeated');
        setTimeout(()=>{
            setIsCreatingNewRoom(true);
        }, 1000);

    }


    
    const handleJoinRoom = () => {
        // first checks if roomcode and username is filled and validates if it is in valid form 
        if (!values.roomCode || !values.username) {
            return toast.error('ROOM CODE & Username is required');
        }
        if (!validate(values.roomCode)) {
            return toast.error('Invalid room Code');
        }
        //stored user details are extracted and object literal is made
        const { name, email, bio, createdAt } = JSON.parse(localStorage.getItem('user'));
        const tobeSendUsername = {
            username: values.username,
            name, email, bio, createdAt
        }
        //now makes an http request to check if the roomcode exists,
        // if it exists, no problem!, we can navigate to workspace route 
        // else just returns and says no such room is there
        axios({
            method: 'GET',
            url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/rooms/${values.roomCode}`,
            headers: {
                Authorization : `Bearer ${token}`
            }
        })
        .then(res => {
            if(!res.data.isRoomPresent){
                toast.error('No such room is available')
                return;
            }
            console.log('hello');

            navigate(`/room/${values.roomCode}`, {
                state: {
                    userDeatils: tobeSendUsername
                }
            }); 
            toast.success('JOINED ROOM')
            return axios({
                method: 'POST',
                url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/user/${currentUser._id}/roomsJoined/add`,
                headers: {
                    Authorization : `Bearer ${token}`
                },
                data : {roomCode: values.roomCode}
            })           
        })
        .then(res => {
            console.log(res.data);
        })
        .catch(err => {
            console.log(err.error);
            toast.error('Error');
        })
    }

    const handleCreateRoom = () => {
        if(!values.roomName || !values.roomDesc){
            toast.error('Please fill both Name and Description');
            return;
        }
        const dataToSendToDB = {
            roomCode: values.roomCode,
            creator: {
                creatorId: currentUser._id,
                creatorEmail: currentUser.email,
                cratorName: currentUser.name,
            },
            name: values.roomName,
            description: values.roomDesc
        };
        axios({
            method: 'POST',
            url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/rooms/new`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: dataToSendToDB
        }).then(response => {
            console.log(response);
            toast.success('Room created!');
            setIsCreatingNewRoom(false);
        }).catch(err => {
            console.log('ROOM CREATE ERROR', err.response.data);
            toast.error(err.response.data.error);
        });


    }

    const handleGoBack = () => {
        setIsCreatingNewRoom(false);
        setValues(prevValues => ({
            ...prevValues, 
            roomCode: '',
            roomDesc: '',
            roomName: ''
        }));
    }

    const roomSelectForm = () => (
        <form>
            <div className='flex flex-col gap-2 mt-4'>
                <input
                    className='w-full input input-bordered h-10 focus:outline'
                    type="text" placeholder='Enter ROOM Code'
                    value={values.roomCode}
                    onChange={e => handleChange(e, 'roomCode')}
                />
                <input
                    className='w-full input input-bordered h-10 focus:outline'
                    type="text" placeholder='Enter your Username'
                    value={values.username}
                    onChange={e => handleChange(e, 'username')}
                />
                <div className='flex justify-between items-center my-4 mx-1'>
                    <button to="/signup"
                        className='btn btn-md lg:w-9/12 btn-accent'
                        onClick={handleJoinRoom}>
                            Join the Room
                    </button>
                    
                    <span className='text-right'>
                        You can also<br />create A&nbsp;
                        <button className='hover:underline hover:text-green-200 text-green-400'
                            onClick={generateNewRoomCode}>
                                new room
                        </button>
                    </span>
                </div>
            </div>
        </form>
    )
    return (
        <Layout navFixed={true} className=' min-h-screen flex flex-col items-center justify-center min-w-96 mx-auto'>
            <div className="rounded-lg shadow-md bg-gray-300 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-5 w-3/4 sm:w-1/2 md:w-1/2 lg:w-1/2 px-6 pb-10 pt-3">
                <h1 className='text-3xl font-semibold text-center text-gray-300 my-6 mx-10'>
                    Create or Join
                    <div className='text-blue-300'>A Room</div>
                    <hr className='mt-4' />
                </h1>
                
                <h4>
                    Paste Invitation Room ID
                </h4>

                {roomSelectForm()}
            </div>

            <dialog className={`modal ${isCreatingNewRoom && 'modal-open'}`}>
                <div className="modal-box">

                    <div className='flex flex-col gap-3 mt-2 mb-4'>
                        <input
                            className='w-full input input-bordered h-10 focus:outline-none'
                            type="text" placeholder='Enter room Name'
                            value={values.roomName}
                            onChange={e => handleChange(e, 'roomName')}/>

                        <input
                            className='w-full input input-bordered h-10 focus:outline-none'
                            type="text" placeholder='Enter room description'
                            value={values.roomDesc}
                            onChange={e => handleChange(e, 'roomDesc')}/>
                    </div>

                    <div className='flex items-center justify-between'>
                        <button className="btn btn-accent w-[45%]"
                            onClick={handleGoBack}>
                                <IoMdArrowRoundBack />Go Back
                        </button>

                        <button className="btn btn-success w-[52%]"
                            onClick={handleCreateRoom}>
                                Create Room
                        </button>
                    </div>

                </div>
            </dialog>

        </Layout>
    )
}

export default RoomSelect