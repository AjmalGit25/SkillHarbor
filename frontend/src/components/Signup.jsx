import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { BACKEND_URL } from "../utils/utils.js";

export default function Signup() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(firstName, lastName, email, password);

    try {
      const response = await axios.post(`${BACKEND_URL}/user/signup`,
        { firstName, lastName, email, password },
        { withCredentials: true, headers: { "Content-Type": "application/json" } });
      console.log("Signup successful", response.data);
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Signup failed!!");
      }
    }
  }

  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen p-2">
      <div className='text-white container mx-auto'>

        {/* Header */}
        <header className='flex items-center justify-between mt-5' >
          <Link to={"/"} className='flex items-center gap-2'>
            <img src="/logo.png" alt="Logo" className='h-8 sm:h-10 w-auto rounded-full bg-red-300' />    {/* logo */}
            <h1 className='font-medium text-md sm:text-2xl text-orange-500'>Course Selling App</h1>
          </Link>

          {/*  */}
          <div className='space-x-4'>
            <Link to={"/login"} className='text-xs sm:text-base bg-transparent text-white py-1.5 px-2 sm:py-2 sm:px-4 border border-white/50 rounded hover:bg-orange-500 transition-colors duration-200'>Login</Link>
            <Link to={"/join"} className='text-xs sm:text-base bg-orange-500 text-white py-1.5 px-2 sm:py-2 sm:px-4 rounded border border-orange-500 hover:bg-white hover:text-black transition-colors duration-200'>Join now</Link>
          </div>
        </header>

        {/* Signup Form */}
        <div className='bg-gray-900 p-8 rounded-lg shadow-lg w-85 sm:w-120 mt-20 mx-auto'>
          <h2 className='text-2xl font-bold mb-4 text-center'>Welcome to <span className='text-orange-500'>Course Selling App</span></h2>
          <p className='text-center text-gray-400 mb-6'>Just Signup To Join Us!</p>

          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <div className='mb-4'>
              <label htmlFor="firstName" className='text-gray-400'>First Name: </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className='w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your first name'
                required />
            </div>
            {/* Last Name */}
            <div className='mb-4'>
              <label htmlFor="lastName" className='text-gray-400'>Last Name: </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className='w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your last name'
                required />
            </div>
            {/* Email */}
            <div className='mb-4'>
              <label htmlFor="email" className='text-gray-400'>Email: </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your email'
                required />
            </div>
            {/* Password */}
            <div className='mb-4'>
              <label htmlFor="password" className='text-gray-400'>Password: </label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='********'
                required />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className='border border-red-500 mb-4 rounded'>
                {errorMessage}
              </div>
            )}

            {/* Button */}
            <div className='mt-4'>
              <button className='bg-orange-500 text-white rounded font-semibold hover:bg-white hover:text-black px-5 py-3 w-full'>Signup</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}