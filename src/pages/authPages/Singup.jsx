import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { IoReturnDownBackOutline } from "react-icons/io5";
import { isAuth } from '../../utils/authUtils/helper';

import Layout from '../Layout'


const Singup = () => {
    const navigate = useNavigate();

    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        bio: '',
        loading: false
    });
    const [passwordShow, setPasswordShow] = useState(false);
    const [isInputfieldPage2, setIsInputfieldPage2] = useState(false);
    

    const handleChange = (e, value) => {
        setValues({
            ...values,
            [value]: e.target.value
        });
    }

    const handleInputErrors = ({ name, email, password, confirmPassword }) => {
        if (!name || !email || !password || !confirmPassword) {
            toast.error('Please fill in all the fields');
            return false;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    }

    const toggleIsInputfieldPage2 = () => {
        setIsInputfieldPage2(prevIsInputfieldPage2 => !prevIsInputfieldPage2)
    }

    const clickNextPageForm = (e) => {
        e.preventDefault();
        if (!values.name || values.name.length < 3) {
            return toast.error('Name is required.');
        }
        toggleIsInputfieldPage2();
    }


    const clickSubmit = async (e) => {
        e.preventDefault();
        setValues({ ...values, loading: true })
        
        
        const dataToSend = {
            name: values.name,
            email: values.email,
            password: values.password,
            bio: values.bio
        }
        console.log(dataToSend);
        if (handleInputErrors(values)) {
            await axios({
                method: 'POST',
                url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/signup`,
                data: dataToSend
            }).then(response => {
                console.log('SIGNIN SUCCESS', response);
                setValues(
                    { ...values, name: '', email: '', password: '', loading: false }
                );
                // toast.success(response.data);
                toast.success(response.data);
                navigate('/signin');
            }).catch(err => {
                console.log('SIGNIN ERROR', err.response.data);
                setValues({ ...values, loading: false });
                toast.error(err.response.data.error);
            });
        } 
        else {
            setValues({ ...values, loading: false });
        }
    }
    
    const signupForm1 = () => (
    <form>


        <div>
            <label className='label p-2'>
                <span className='text-base label-text'>
                    Name :
                </span>
            </label>
            <input
                className='w-full input input-bordered h-10 focus:outline-none'
                type="text" placeholder='Enter your name'
                value={values.name}
                onChange={(e => handleChange(e, 'name'))}
            />
        </div>

        <div>
            <label className='label p-2'>
                <span className='text-base label-text'>
                    About yourself :
                </span>
            </label>
            <input
                className='w-full input input-bordered h-10 focus:outline-none'
                type='text' placeholder='A short description about you'
                value={values.bio}
                onChange={(e => handleChange(e, 'bio'))}
            />
        </div>

        <Link to="/signin"
            className='text-sm hover:underline hover:text-blue-500 inline-block mt-2'
        >Already have an account?
        </Link>

        <div>
            <button className='btn btn-block mt-2 btn-accent'
                onClick={clickNextPageForm}
                disabled={values.loading}
            >{values.loading ? (
                <span className='loading loading-spinner'></span>
            ) : 'Next'}
            </button>
        </div>
    </form>
    )

    const signupForm2 = () => (
        <form>
            <div>
                <label className='label p-2'>
                    <span className='text-base label-text'>
                        Email :
                    </span>
                </label>
                <input
                    className='w-full input input-bordered h-10 focus:outline-none'
                    type="email" placeholder='Enter your email'
                    value={values.email}
                    onChange={(e => handleChange(e, 'email'))}
                />
            </div>
            <div>
                <label className='label p-2'>
                    <span className='text-base label-text'>
                        Password :
                    </span>
                </label>
                <input
                    className='w-full input input-bordered h-10 focus:outline-none'
                    type={passwordShow ? 'text' : 'password'} placeholder='Enter password'
                    value={values.password}
                    onChange={(e => handleChange(e, 'password'))}
                />
            </div>
            <div>
                <label className='label p-2'>
                    <span className='text-base label-text'>
                        Confirm Password :
                    </span>
                </label>
                <input
                    className='w-full input input-bordered h-10 focus:outline-none'
                    type={passwordShow ? 'text' : 'password'} placeholder='Confirm password'
                    value={values.confirmPassword}
                    onChange={(e => handleChange(e, 'confirmPassword'))}
                />
            </div>

            <div className='flex items-center h-full justify-between'>
                <div className='flex flex-col justify-between'>
                    <label className='mt-1 label justify-start gap-2 cursor-pointer'>
                        <input type="checkbox"
                            className='checkbox checkbox-primary border-slate-400'
                            onChange={() => setPasswordShow(!passwordShow)}
                        />
                        <span className='label-text'>Show Password</span>
                    </label>

                    <Link to="/signin"
                        className='text-sm hover:underline hover:text-blue-500 inline-block sm:mt-2'
                    >Already have an account?
                    </Link>
                </div>
                <button className='btn btn-ghost h-full w-1/3 text-md py-2 sm:mt-0 sm:text-right'
                    onClick={toggleIsInputfieldPage2}
                ><IoReturnDownBackOutline className='sm:text-3xl text-xl ' />
                    <span className='hidden sm:block'>Go Back</span>
                    <span className='block sm:hidden'>Back</span>
                </button>
            </div>

            <div>
                <button className='btn btn-block mt-2 btn-accent'
                    onClick={clickSubmit}
                    disabled={values.loading}
                >{values.loading ? (
                    <span className='loading loading-spinner'></span>
                ) : 'Sign Up'}
                </button>
            </div>
        </form>
    )

    return (
        <Layout navFixed={true} className='min-h-screen bg-gray-900 flex flex-col items-center justify-center min-w-96 mx-auto'>
            <div className="rounded-lg shadow-md bg-gray-800 bg-clip-padding backdrop-filter backdrop-blur-lg  w-3/4 sm:w-1/2 md:w-1/2 lg:w-1/2 px-10 py-6">
                {isAuth() ? <Navigate to='/' /> : null}
                <h1 className='text-3xl font-semibold text-center text-gray-300 mt-2 mb-4'>
                    <span className='text-blue-300'>{"Let's"}</span>
                    &nbsp;Sign Up
                </h1>

                {isInputfieldPage2 ?
                    signupForm2() : signupForm1()
                }
            </div>
        </Layout>
    )
}

export default Singup







