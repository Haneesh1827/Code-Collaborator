import { useEffect, useState } from 'react'
import axios from 'axios'
import Layout from './Layout.jsx'
import { getCookie, isAuth } from '../utils/authUtils/helper.jsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Home = () => {
    //
    const navigate = useNavigate();
    const [allRooms, setAllRooms] = useState([]);
    const currentUser = JSON.parse(localStorage.getItem('user'));
    useEffect(() => {
        getAllRooms();
    }, []);
    // get rooms joined previously by user
    const getAllRooms = async () => {
        const token = getCookie('token');
        const userId = isAuth()._id
        await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/user/${userId}/roomsJoined`,
            headers: {
                Authorization: `Bearer ${token}`
            },
        }).then(response => {
            const allFetchedRooms = response.data;
            console.dir(allFetchedRooms[0].creator.creatorId);
            setAllRooms(allFetchedRooms);
        }).catch(err => {
            console.log('ROOM CREATE ERROR', err.response.data);
            toast.error(err.response.data.error);
        });
    }
    
    const handleJoinRoom = (currentRoomCode) => {
    
        const tobeSendUsername = {
            username: currentUser.name,
            name: currentUser.name,
            email: currentUser.email, 
            bio: currentUser.bio,
            createdAt: currentUser.createdAt
        };
        navigate(`/room/${currentRoomCode}`, {
            state: {
                userDeatils: tobeSendUsername
            }
        }); 
        toast.success('Joined room');
    }
    const handleDeleteRoom = async (currentRoomCode) => {
        const token = getCookie('token');
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const dataToSend = {
            roomCode: currentRoomCode,
            givenCreatorId: currentUser._id
        }
        await axios({
            method: 'POST',
            url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/rooms/delete`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: dataToSend
        }).then(response => {
            // console.log(response.data);
            getAllRooms();
        }).catch(err => {
            console.log('ROOM CREATE ERROR', err.response.data);
            toast.error(err.response.data.error);
        });
    }
    const handleRemoveRoom = () => {}
    return (
        <Layout>
            <div className="col-d-6 offset-md-1 text-center">
                <h1 className='p-5 pb-3 border-b-[1px] mx-[8%] text-xl'>
                    Previously Joined Rooms
                </h1>
                <h3>
                    {currentUser._id}
                </h3>
                {/* <hr /> */}
                <div className='flex flex-wrap'>
                    {allRooms.length > 0 && allRooms.map(eachRoom => (
                        <div className="card w-1/2 bg-base-100 shadow-xl" key={eachRoom._id}>
                            <div className="card-body items-center text-center text-sm">
                                <h2 className="card-title">- {eachRoom.name} -</h2>
                                <p className='text-xs'>RoomCode: {eachRoom.roomCode}</p>
                                <p>( {eachRoom.description} )</p>
                                <p>Creator: {eachRoom.creator.cratorName }</p>
                                
                                <p>Created on: {eachRoom.createdAt.substring(0, 10)}</p>
                                <div className="card-actions">
                                    <button className="btn btn-primary"
                                        onClick={() => handleJoinRoom(eachRoom.roomCode)}
                                    >Join Room</button>
                                    { (currentUser._id === eachRoom.creator.creatorId) ? 
                                        <button className="btn btn-error"
                                            onClick={() => handleDeleteRoom(eachRoom.roomCode)}
                                        >Delete</button> : ''
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    )
}

export default Home