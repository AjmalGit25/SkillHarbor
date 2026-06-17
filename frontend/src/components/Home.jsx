import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css"; // Import Swiper styles
import toast from 'react-hot-toast';

import { BACKEND_URL } from "../utils/utils.js";

const Home = () => {
  const [courses, setCourses] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // token
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true);
    }
    else {
      setIsLoggedIn(false);
    }
  }, []);

  // Logout
  const handleLogOut = async () => {
    try {
      const response = axios.get(`${BACKEND_URL}/user/logout`, {
        withCredentials: true,
      });
      toast.success((await response).data.message);
      setIsLoggedIn(false);
      localStorage.removeItem("user");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response.data.message || "Error in logging out!!");
    }
  };

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/courses`,
          { withCredentials: true }
        );
        setCourses(response.data.courses);
      } catch (error) {
        console.log("Error while fetching courses: ", error);
      }
    }

    fetchCourses();
  }, []);


  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen p-2">
      <div className='text-white container mx-auto'>

        {/* Header */}
        <header className='flex items-center justify-between mt-5' >
          <Link to={"/"} className='flex items-center gap-2'>
            <img src="/logo.png" alt="Logo" className='h-10 w-auto rounded-full bg-red-300' />    {/* logo */}
            <h1 className='font-medium text-2xl text-orange-500'>Course Selling App</h1>
          </Link>
          <div className='space-x-4'>
            {isLoggedIn ? (
              <button onClick={handleLogOut} className='bg-transparent text-white py-1 px-4 border border-white rounded cursor-pointer'>Logout</button>
            ) : (
              <>
                <Link to={"/login"} className='bg-transparent text-white py-2 px-4 border border-white rounded'>Login</Link>
                <Link to={"/signup"} className='bg-orange-500 text-white py-2 px-4 rounded'>Signup</Link>
              </>
            )}
          </div>
        </header>

        {/* Section 1 */}
        <section className='text-center mt-8'>
          <h1 className='font-medium text-4xl text-orange-500 mb-8'>Course Selling App</h1>
          <p className='text-gray-500'>Sharpen your skills with courses crafted by experts.</p>
          <div className='space-x-4 mt-4'>
            <Link to={"/courses"} className='bg-green-500 text-white rounded font-semibold hover:bg-white duration-300 hover:text-black px-5 py-2'>Explore Courses</Link>
            <Link to={""} className='bg-white text-black rounded font-semibold hover:text-white duration-300 hover:bg-green-500 px-5 py-2'>Courses Videos</Link>
          </div>
        </section>

        {/* Slider */}
        <section className='text-center mt-8'>
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={2}   // key line
            loop={true}
            autoplay={{
              delay: 1000,              // continuous effect
              disableOnInteraction: false,
            }}
            speed={2000}                // controls smoothness
          >
            {
              courses.map((course) => (
                <SwiperSlide key={course._id}>
                  <div className='relative flex justify-center p-3'>
                    <div className='bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center gap-2 w-80 p-3 hover:scale-105 duration-300'>

                      <img
                        src={course.image.url}
                        alt={course.title}
                        className='h-30 w-auto object-contain'
                      />

                      <h2 className='font-bold text-lg text-center'>
                        {course.title}
                      </h2>

                      <button className='rounded-full bg-orange-500 p-1 px-4 cursor-pointer text-white hover:bg-white duration-300 hover:text-orange-500'>
                        Enroll Now
                      </button>

                    </div>
                  </div>
                </SwiperSlide>
              ))
            }
          </Swiper>
        </section>

        <hr className='my-8' />

        {/* Footer */}
        <footer>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='flex flex-col items-center md:items-start'>
              <div className='flex items-center gap-2'>
                <img src="/logo.png" alt="Logo" className='h-10 w-auto rounded-full bg-red-300' />    {/* logo */}
                <h1 className='font-medium text-2xl text-orange-500'>Course Selling App</h1>
              </div>
              <div className='mt-3 ml-2 md:ml-8'>
                <p className='mb-2'>Follow Us</p>
                <div className='flex space-x-4'>
                  <a href=""><FaFacebook /></a>
                  <a href=""><FaInstagram /></a>
                  <a href=""><FaXTwitter /></a>
                </div>
              </div>
            </div>
            <div className='flex flex-col items-center'>
              <h3 className='font-bold text-xl mb-2'>Quick Links</h3>
              <ul className='list-none space-y-2 text-gray-400'>
                <li className='hover:text-white duration-300'><a href="">Youtube- learn coding</a></li>
                <li className='hover:text-white duration-300'><a href="">Linkedin- learn coding</a></li>
                <li className='hover:text-white duration-300'><a href="">Github- learn coding</a></li>
              </ul>
            </div>
            <div className='flex flex-col items-center'>
              <h3 className='font-bold text-xl mb-2'>Copyright &copy; 2026</h3>
              <ul className='list-none space-y-2 text-gray-400'>
                <li className='hover:text-white duration-300'><a href="">Terms & Conditions</a></li>
                <li className='hover:text-white duration-300'><a href="">Privacy & Policy</a></li>
                <li className='hover:text-white duration-300'><a href="">Refunds & Cancellation</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>

  )
}

export default Home;
