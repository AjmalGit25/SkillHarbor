import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Navbar from '../../components/Navbar.jsx';

import { BACKEND_URL } from '../../utils/utils.js';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [courseStats, setCourseStats] = useState({});
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/course/courses`, { withCredentials: true });
        const courseList = data.courses || [];
        setCourses(courseList);
        setFiltered(courseList);
        setLoading(false);

        const stats = {};
        await Promise.all(
          courseList.map(async (course) => {
            const { data: modData } = await axios.get(`${BACKEND_URL}/content/course/${course._id}/modules`, { withCredentials: true });
            const moduleList = modData.modules || [];
            const lessonCounts = await Promise.all(
              moduleList.map(async (mod) => {
                const { data: lessonData } = await axios.get(`${BACKEND_URL}/content/modules/${mod._id}/lessons`, { withCredentials: true });
                return (lessonData.lessons || []).length;
              })
            );
            stats[course._id] = {
              modules: moduleList.length,
              lessons: lessonCounts.reduce((a, b) => a + b, 0),
            };
          })
        );

        setCourseStats(stats);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load courses');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)));
  }, [search, courses]);

  // Scroll reveal Animation
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target); // Stop observing after first reveal
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".card").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filtered]);

  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">
      <Navbar />
      <main className="px-4 py-5 sm:py-10">

        {/* Page Hero */}
        <section className="text-center mb-10">
          <span className="inline-block bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold px-4 py-1 rounded-full mb-5 tracking-widest uppercase">📚 All Courses</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">
            Explore Our <span className="bg-linear-to-l from-sky-500 to-blue-800 bg-clip-text text-transparent">Courses</span>
          </h1>
          <p className="text-gray-400 mt-4 text-base max-w-xl mx-auto leading-relaxed">
            Browse our full library of expert-crafted courses. Find the right one and start learning today.
          </p>

          {/* Search Bar */}
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center bg-white/5 border border-white/15 rounded-full px-4 py-2 w-full max-w-md focus-within:border-sky-500 transition-colors duration-200">
              <FiSearch className="text-gray-400 text-lg mr-3 shrink-0" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-white placeholder-gray-500 outline-none w-full text-sm"
              />
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="my-10">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-gray-400 text-lg">No courses found{search ? ` for "${search}"` : ''}.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-6">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

                {/* Course Card */}
                {filtered.map((course) => (
                  <Link to={`/courses/${course._id}`} key={course._id} className="card bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-sky-500/50 hover:bg-white/10 transition-all duration-300 flex flex-col">
                    <div className="relative p-3">
                      <img
                        src={course.image.url}
                        alt={course.title}
                        className="w-full h-40 object-contain bg-slate-950 rounded-2xl"
                      />
                      <span className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">20% off</span>
                    </div>
                    <div className="flex flex-col flex-1 space-y-4 px-3">
                      <h2 className="font-medium text-lg text-white line-clamp-1">{course.title}
                      </h2>
                      <hr className="text-slate-700" />
                      <div className="flex items-center justify-between gap-3 text-sm text-gray-400 ">
                        <span>📦 {courseStats[course._id]?.modules ?? '—'} Modules</span>
                        <span>🎬 {courseStats[course._id]?.lessons ?? '—'} Lessons</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {course.price !== 0 ? (
                            <span className="text-white font-semibold">₹{course.price}</span>
                          ) : (
                            <span className="text-green-500 font-semibold">Free</span>
                          )}
                          <span className="text-gray-500 line-through text-sm ml-2">₹5999</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          ★★★★★
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        <hr className="my-8 border-white/10" />

        {/* Footer */}
        <footer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 card">

            <div className="flex flex-col items-center md:items-start space-y-3">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="h-10 w-auto rounded-full" />
                <h1 className="font-medium text-2xl">
                  <span className="bg-linear-to-l from-sky-500 to-blue-800 bg-clip-text text-transparent">Skill</span>
                  <span className="text-white">Harbor</span>
                </h1>
              </div>
              <div className="space-y-1">
                <p>Follow Us</p>
                <div className="flex space-x-4">
                  <a href=""><FaFacebook /></a>
                  <a href=""><FaInstagram /></a>
                  <a href=""><FaXTwitter /></a>
                </div>
              </div>
              <h3 className="font-thin">Md Ajmal Hussain &copy; 2026</h3>
            </div>

            <div className="flex flex-col items-center">
              <h3 className="font-bold text-xl mb-2">Quick Links</h3>
              <ul className="list-none space-y-2 text-gray-400">
                <li className="hover:text-sky-500 duration-300"><a href="">Youtube - SkillHarbor</a></li>
                <li className="hover:text-sky-500 duration-300"><a href="">Linkedin - SkillHarbor</a></li>
                <li className="hover:text-sky-500 duration-300"><a href="https://github.com/AjmalGit25/SkillHarbor">Github - SkillHarbor</a></li>
              </ul>
            </div>

            <div className="flex flex-col items-center">
              <h3 className="font-bold text-xl mb-2">Help & Support</h3>
              <ul className="list-none space-y-2 text-gray-400">
                <li className="hover:text-sky-500 duration-300"><a href="">Terms & Conditions</a></li>
                <li className="hover:text-sky-500 duration-300"><a href="">Privacy & Policy</a></li>
                <li className="hover:text-sky-500 duration-300"><a href="">Refunds & Cancellation</a></li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
