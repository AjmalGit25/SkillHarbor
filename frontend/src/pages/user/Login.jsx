import { useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import Navbar from '../../components/Navbar.jsx';

import { BACKEND_URL } from "../../utils/utils.js";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(email, password);

    try {
      const response = await axios.post(`${BACKEND_URL}/user/login`,
        { email, password },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      console.log("Login successful", response.data);
      toast.success(response.data.message);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Login failed!!");
        for (let i = 0; i < errorMessage.length; i++) {
          console.log(errorMessage[i], " ");
        }
      }
    }
  }

  // input class
  const inputClass = "w-full p-1.5 sm:p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen">
      <Navbar />
      <div className='text-white container mx-auto px-4'>

        {/* Login Form */}
        <div className='bg-gray-900 p-8 rounded-lg w-75 sm:w-120 shadow-lg mt-20 mx-auto'>
          <h2 className='text-2xl font-bold mb-4 text-center'>Welcome to <span className='text-orange-500'>SkillHarbor</span></h2>
          <p className='text-center text-gray-400 mb-6'>Log in to access paid content!</p>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className='mb-4'>
              <label htmlFor="email" className='text-gray-400'>Email: </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
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
                className={inputClass}
                placeholder='********'
                required />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className='text-red-500'>
                {errorMessage}
              </div>
            )}

            {/* Button */}
            <div className='mt-4'>
              <button
                className='bg-orange-500 text-white rounded font-semibold hover:bg-blue-600 px-5 py-2 sm:py-3 w-full transition-colors duration-200 cursor-pointer'
              >
                Login
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
