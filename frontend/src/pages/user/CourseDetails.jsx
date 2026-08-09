import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiChevronDown, FiChevronUp, FiClock, FiPlayCircle } from 'react-icons/fi';
import { HiOutlineBookOpen } from 'react-icons/hi';
import { MdOutlineVideoLibrary } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { BACKEND_URL } from '../../utils/utils.js';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openModules, setOpenModules] = useState({});

  const userData = JSON.parse(localStorage.getItem('user') || 'null');
  const token = userData?.token;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: courseData } = await axios.get(`${BACKEND_URL}/course/${courseId}`, { withCredentials: true });
        setCourse(courseData.course);

        const { data: modData } = await axios.get(`${BACKEND_URL}/content/course/${courseId}/modules`, { withCredentials: true });
        const moduleList = modData.modules || [];

        const modulesWithLessons = await Promise.all(
          moduleList.map(async (mod) => {
            const { data: lessonData } = await axios.get(`${BACKEND_URL}/content/modules/${mod._id}/lessons`, { withCredentials: true });
            return { ...mod, lessons: lessonData.lessons || [] };
          })
        );

        setModules(modulesWithLessons);
        // Open first module by default
        if (modulesWithLessons.length > 0) {
          setOpenModules({ [modulesWithLessons[0]._id]: true });
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleEnrollFree = async () => {
    if (!token) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await axios.post(`${BACKEND_URL}/course/enroll-free/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success('Enrolled successfully!');
      navigate('/purchases');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (id) => setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalDuration = modules.reduce((acc, m) => acc + m.lessons.reduce((a, l) => a + (l.duration || 0), 0), 0);
  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) {
    return (
      <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-gray-400 text-lg">Course not found.</p>
        </div>
      </div>
    );
  }

  const isFree = course.price === 0;

  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-10 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left — Course Info + Curriculum */}
          <div className="flex-1 space-y-6">
            {/* Hero */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <img src={course.image?.url} alt={course.title} className="w-full h-56 object-cover" />
              <div className="p-6">
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${isFree ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'}`}>
                  {isFree ? '🎓 Free Course' : '💎 Premium Course'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{course.title}</h1>
                <p className="mt-3 text-gray-400 leading-relaxed">{course.description}</p>

                {/* Stats row */}
                <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineBookOpen className="text-orange-400" />
                    {modules.length} module{modules.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MdOutlineVideoLibrary className="text-sky-400" />
                    {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                  </span>
                  {totalDuration > 0 && (
                    <span className="flex items-center gap-1.5">
                      <FiClock className="text-purple-400" />
                      {formatDuration(totalDuration)} total
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Curriculum */}
            {modules.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <HiOutlineBookOpen className="text-orange-400" /> Course Curriculum
                </h2>
                <div className="space-y-2">
                  {modules.map((mod, mi) => (
                    <div key={mod._id} className="rounded-xl border border-white/10 overflow-hidden">
                      <button
                        onClick={() => toggleModule(mod._id)}
                        className="w-full flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 px-4 py-3 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/20 border border-orange-500/40 text-xs font-bold text-orange-400">
                            {mi + 1}
                          </span>
                          <span className="font-semibold text-white text-sm">{mod.title}</span>
                          <span className="text-xs text-gray-500">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}</span>
                        </div>
                        {openModules[mod._id] ? <FiChevronUp className="text-gray-400 shrink-0" /> : <FiChevronDown className="text-gray-400 shrink-0" />}
                      </button>

                      {openModules[mod._id] && (
                        <ul className="border-t border-white/10 divide-y divide-white/5">
                          {mod.lessons.map((lesson, li) => (
                            <li key={lesson._id} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400">
                              <FiPlayCircle className="shrink-0 text-sky-400" />
                              <span className="flex-1">{lesson.title}</span>
                              {lesson.duration > 0 && (
                                <span className="text-xs text-gray-600">{Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s</span>
                              )}
                            </li>
                          ))}
                          {mod.lessons.length === 0 && (
                            <li className="px-4 py-3 text-sm text-gray-600 italic">No lessons yet</li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Sticky CTA Card */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
              <img src={course.image?.url} alt={course.title} className="w-full h-36 object-contain rounded-xl" />

              <div>
                {isFree ? (
                  <p className="text-3xl font-extrabold text-green-400">Free</p>
                ) : (
                  <p className="text-3xl font-extrabold text-white">₹{course.price}</p>
                )}
              </div>

              {isFree ? (
                <button
                  onClick={handleEnrollFree}
                  disabled={enrolling}
                  className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-60 text-white font-bold py-3 rounded-full transition-colors duration-200"
                >
                  {enrolling ? 'Enrolling...' : '🎓 Enroll for Free'}
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/checkout/${courseId}`)}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-full transition-colors duration-200"
                >
                  Buy Course
                </button>
              )}

              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-center gap-2"><HiOutlineBookOpen className="text-orange-400" /> {modules.length} modules</li>
                <li className="flex items-center gap-2"><MdOutlineVideoLibrary className="text-sky-400" /> {totalLessons} lessons</li>
                {totalDuration > 0 && <li className="flex items-center gap-2"><FiClock className="text-purple-400" /> {formatDuration(totalDuration)} of content</li>}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
