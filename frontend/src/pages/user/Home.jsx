import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import axios from 'axios';
import { useEffect, useState } from 'react';
import Counter from '../../components/Counter.jsx';
import Navbar from '../../components/Navbar.jsx';

import { BACKEND_URL } from "../../utils/utils.js";

const Home = () => {
  const [courses, setCourses] = useState([]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.target.classList.toggle('show', e.isIntersecting)),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.card').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [courses]);

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
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">

      <Navbar />
      <main className="container mx-auto px-4 py-10">

        {/* Hero Section */}
        <section className='text-center mt-14 mb-10'>
          <span className='inline-block bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold px-4 py-1 rounded-full mb-5 tracking-widest uppercase'>🎓 Learn. Build. Grow.</span>
          <h1 className='text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight'>
            <span className='bg-linear-to-l from-sky-500 to-blue-800 bg-clip-text text-transparent'>Skill</span>
            <span className='text-white'>Harbor</span>
          </h1>
          <p className='text-gray-400 mt-4 text-base sm:text-lg max-w-xl mx-auto leading-relaxed'>
            Sharpen your skills with courses crafted by industry experts. Learn at your own pace, earn certificates, and land your dream job.
          </p>
          <div className='flex flex-wrap justify-center gap-4 mt-8'>
            <Link to={'/courses'} className='bg-sky-500 hover:bg-sky-400 text-white font-semibold px-7 py-2.5 rounded-full transition-colors duration-200'>Explore Courses</Link>
            <Link to={'/signup'} className='bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-2.5 rounded-full transition-colors duration-200'>Get Started Free</Link>
          </div>
        </section>

        {/* Stats Bar */}
        <section className='grid grid-cols-2 sm:grid-cols-4 gap-4 my-10'>
          {[
            { value: 1751, label: 'Students Enrolled' },
            { value: 120, label: 'Expert Courses' },
            { value: 50, label: 'Top Instructors' },
            { value: 4.5, label: 'Average Rating' },
          ].map(({ value, label }) => (
            <div key={label} className='bg-white/5 border border-white/10 rounded-xl py-5 text-center'>
              <p className='text-2xl font-bold text-sky-400'><Counter end={value} /></p>

              <p className='text-gray-400 text-sm mt-1'>{label}</p>
            </div>
          ))}
        </section>

        {/* Why SkillHarbor */}
        <section className='my-12'>
          <h2 className='text-center text-2xl font-bold text-white mb-8'>Why <span className='text-sky-400'>SkillHarbor?</span></h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
            {[
              { icon: '🚀', title: 'Learn at Your Pace', desc: 'Access course content anytime, anywhere. No deadlines, no pressure — just pure learning.' },
              { icon: '🏆', title: 'Expert Instructors', desc: 'Every course is built by industry professionals with real-world experience.' },
              { icon: '📜', title: 'Earn Certificates', desc: 'Get recognized certificates upon completion to boost your resume and LinkedIn.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className='bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-sky-500/50 hover:bg-white/10 transition-all duration-300'>
                <div className='text-4xl mb-3'>{icon}</div>
                <h3 className='text-white font-semibold text-lg mb-2'>{title}</h3>
                <p className='text-gray-400 text-sm leading-relaxed'>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className='my-12'>
          <h2 className='text-center text-2xl font-bold text-white mb-8'>What Our <span className='text-sky-400'>Students Say</span></h2>
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
            {[
              { name: 'Rahul Sharma', role: 'Frontend Developer', text: 'SkillHarbor helped me land my first dev job. The courses are practical and straight to the point!', avatar: '👨‍💻' },
              { name: 'Priya Mehta', role: 'UI/UX Designer', text: 'Amazing platform! I completed 3 courses in a month and got a freelance project right after.', avatar: '👩‍🎨' },
              { name: 'Arjun Patel', role: 'Data Analyst', text: 'The instructors are top-notch. I went from zero to job-ready in just 2 months.', avatar: '👨‍💼' },
            ].map(({ name, role, text, avatar }) => (
              <div key={name} className='bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-sky-500/40 transition-all duration-300'>
                <p className='text-gray-300 text-sm leading-relaxed mb-4'>"{text}"</p>
                <div className='flex items-center gap-3'>
                  <span className='text-3xl'>{avatar}</span>
                  <div>
                    <p className='text-white font-semibold text-sm'>{name}</p>
                    <p className='text-sky-400 text-xs'>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Slider */}
        <section className='mt-8 overflow-hidden card'>
          <div className='flex scroll-track w-max p-5'>
            {[...courses, ...courses].map((course, i) => (
              <div key={i} className='bg-gray-900 rounded-lg overflow-hidden flex flex-col items-center gap-2 w-64 p-3 mx-3 hover:scale-105 duration-300 shrink-0'>
                <img src={course.image.url} alt={course.title} className='h-30 w-auto object-contain' />
                <h2 className='font-bold text-lg text-center'>{course.title}</h2>
                <button className='rounded-full bg-orange-500 p-1 px-4 cursor-pointer text-white hover:bg-white duration-300 hover:text-orange-500'>Enroll Now</button>
              </div>
            ))}
          </div>
        </section>

        <hr className='my-8' />

        {/* Footer ======================================================== */}
        <footer>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 card'>

            {/* Left Footer - Logo and Social Media */}
            <div className='flex flex-col items-center md:items-start space-y-3'>

              <div className='flex items-center gap-2'>
                <img src="/logo.png" alt="Logo" className='h-10 w-auto rounded-full' />    {/* logo */}
                <h1 className='font-medium text-md sm:text-2xl '>
                  <span className='bg-linear-to-l from-sky-500 to-blue-800 bg-clip-text text-transparent'>Skill</span>
                  <span className='text-white'>Harbor</span>
                </h1>
              </div>

              {/* Social Media Links */}
              <div className='space-y-1'>
                <p className=''>Follow Us</p>
                <div className='flex space-x-4'>
                  <a href=""><FaFacebook /></a>
                  <a href=""><FaInstagram /></a>
                  <a href=""><FaXTwitter /></a>
                </div>
              </div>

              {/* Copyright */}
              <div>
                <h3 className='font-thin'>
                  Md Ajmal Hussain &copy; 2026
                </h3>
              </div>
            </div>

            {/* Middle Footer -  */}
            <div className='flex flex-col items-center'>
              <h3 className='font-bold text-xl mb-2'>Quick Links</h3>
              <ul className='list-none space-y-2 text-gray-400'>
                <li className='hover:text-sky-500 duration-300'><a href="">Youtube - SkillHarbor</a></li>
                <li className='hover:text-sky-500 duration-300'><a href="">Linkedin - SkillHarbor</a></li>
                <li className='hover:text-sky-500 duration-300'><a href="https://github.com/AjmalGit25/SkillHarbor">Github - SkillHarbor</a></li>
              </ul>
            </div>

            {/* Right Footer - Help and Support */}
            <div className='flex flex-col items-center'>
              <h3 className='font-bold text-xl mb-2'>Help & Support</h3>
              <ul className='list-none space-y-2 text-gray-400'>
                <li className='hover:text-sky-500 duration-300'><a href="">Terms & Conditions</a></li>
                <li className='hover:text-sky-500 duration-300'><a href="">Privacy & Policy</a></li>
                <li className='hover:text-sky-500 duration-300'><a href="">Refunds & Cancellation</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default Home;
