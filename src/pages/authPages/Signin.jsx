import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { authenticate, isAuth } from '../../utils/authUtils/helper'
import Layout from '../Layout'

const Signin = () => {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        email: '',
        password: '',
        loading: false
    });
    const [passwordShow, setPasswordShow] = useState(false);
    
    const handleChange = (e, value) => {
        setValues({
            ...values,
            [value]: e.target.value
        });
    }

    const handleInputErrors = ({ email, password }) => {
        if (!email || !password) {
            toast.error('Please fill in all the fields');
            return false;
        }
        return true;
    }

    const clickSubmit = async (e) => {
        console.log('hello');
        e.preventDefault();
        setValues({ ...values, loading: true })
        const dataToSend = { email: values.email, password: values.password }
        console.log(dataToSend);
        if (handleInputErrors(values)) {
            console.log('inside if statement');
            await axios({
                method: 'POST',
                url: `${import.meta.env.VITE_BACKEND_ENDPOINT}/signin`,
                data: dataToSend
            }).then(response => {
                console.log('SIGNIN SUCCESS', response);
                authenticate(response, () => {
                    setValues(
                        { ...values, name: '', email: '', password: '', loading: false }
                    );
                    toast.success(`Hey ${response.data.user.name}, Welcome back!`);
                    isAuth() && (navigate('/'))
                });
            }).catch(err => {
                console.log('SIGNUP ERROR', err.response.data);
                setValues({ ...values, loading: false });
                toast.error(err.response.data.error);
            });
        } else {
            setValues({ ...values, loading: false });
        }
    }

    const signinForm = () => (
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
                    onChange={e => handleChange(e, 'email')}
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
                    type={passwordShow ? 'text' : 'password'}
                    placeholder='Enter your password'
                    value={values.password}
                    onChange={e => handleChange(e, 'password')}
                />
                <label className='mt-1 label justify-start gap-2 cursor-pointer'>
                    <input type="checkbox"
                        className='checkbox checkbox-primary border-slate-400'
                        onChange={() => setPasswordShow(!passwordShow)}
                    />
                    <span className='label-text'>Show Password</span>
                </label>
            </div>

            

            <div className='flex justify-between text-xs sm:text-sm mt-3'>
                <Link to="/signup"
                    className='hidden sm:inline-block hover:underline hover:text-blue-500'
                >{"Don't"} have an account ?
                </Link>
                <Link to="/signup"
                    className='sm:hidden hover:underline hover:text-blue-500 inline-block'
                >Create account
                </Link>
            </div>
            <div>
                <button className='btn btn-block mt-2 btn-accent'
                    onClick={clickSubmit}
                    disabled={values.loading}
                >{values.loading ? (
                    <span className='loading loading-spinner'></span>
                ) : 'Login'}
                </button>
            </div>
        </form>
        
    )

    return (
        <Layout navFixed={true} className='min-h-screen bg-gray-900 flex flex-col items-center justify-center min-w-96 mx-auto'>
            <div className="rounded-md shadow-md bg-gray-800 bg-clip-padding backdrop-filter backdrop-blur-lg  w-3/4 sm:w-1/2 md:w-1/2 lg:w-1/2 px-10 py-6">
                {isAuth() ? <Navigate to='/' /> : null}
                <h1 className='text-3xl font-semibold text-center text-gray-300 my-6'>
                    Welcome Back
                </h1>
                {signinForm()}
            </div>
        </Layout>
    )
}

export default Signin