import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from '../pages/Home'
import Singin from '../pages/authPages/Signin'
import Singup from '../pages/authPages/Singup'

import RoomSelect from '../pages/RoomSelect.jsx'
import PrivateRoutes from './PrivateRoleRoutes.jsx'
import UserProfile from '../pages/UserProfile.jsx'

import Workspace from '../pages/workspacePages/Workspace.jsx'
import WorkspaceProvider from '../context/WorkspaceProvider.jsx';
import { Toaster } from 'react-hot-toast'


const RoutePages = () => {
    return (
        <BrowserRouter>
            <Routes>
                <>
                    <Route path='/signup' element={<Singup />} />
                    <Route path='/signin' element={<Singin />} /> 
                </>
                {/* Private Routes ------------------------------- */}
                <Route element={<PrivateRoutes />}>
                    <Route path='/' element={<Home />} />
                    <Route path='/room' element={<RoomSelect />} />
                    <Route path='/room/:roomCode' element={
                        <WorkspaceProvider>
                            <Workspace />
                        </WorkspaceProvider>
                    } />
                    <Route path='/user' element={<UserProfile />} />
                </Route>
            </Routes>
            <Toaster
                position="top-right"
                reverseOrder={false}
            />
        </BrowserRouter>
    )
}

export default RoutePages   