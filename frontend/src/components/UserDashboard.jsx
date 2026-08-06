import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from './Navbar';

import { BACKEND_URL } from '../utils/utils.js';

export default function UserDashboard() {
  const [purchase, setPurchase]       = useState([]);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setIsLoggedIn(true);
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogOut = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/logout`, { withCredentials: true });
      toast.success(res.data.message);
    } catch { /* silent */ }
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { setLoading(false); return; }
    const token = JSON.parse(stored).token;
    const fetchPurchases = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/user/purchases`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setPurchase(res.data.courseData);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">
      <Navbar />

      {/* ── MAIN CONTENT ───────────────────────────────────────────── */}
      <main className="container mx-auto px-4 py-10">

        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-sky-500/20 to-blue-800/20 border border-sky-500/20 rounded-2xl px-8 py-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, <span className="text-sky-400">{user?.email?.split('@')[0] ?? 'Learner'}</span> 👋
            </h1>
            <p className="text-gray-400 mt-1 text-sm">Continue where you left off. Your learning journey awaits.</p>
          </div>
          <Link to="/courses" className="shrink-0 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-2.5 rounded-full transition-colors duration-200">
            Browse Courses
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Courses Purchased', value: purchase.length },
            { label: 'In Progress',       value: purchase.length },
            { label: 'Completed',         value: 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl py-5 text-center">
              <p className="text-3xl font-bold text-sky-400">{value}</p>
              <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* My Courses */}
        <h2 className="text-xl font-bold text-white mb-6">My Purchased Courses</h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !isLoggedIn ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-5xl mb-4">🔒</p>
            <p className="text-gray-400 mb-4">Please log in to see your purchased courses.</p>
            <Link to="/login" className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-full font-semibold transition-colors duration-200">Login</Link>
          </div>
        ) : purchase.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-400 mb-4">You haven't purchased any courses yet.</p>
            <Link to="/courses" className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-full font-semibold transition-colors duration-200">Explore Courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchase.map((course, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-sky-500/50 hover:bg-white/10 transition-all duration-300 flex flex-col">
                <img
                  src={course.image?.url || '/logo.png'}
                  alt={course.title}
                  className="w-full h-44 object-cover"
                />
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-semibold text-sm">✓ Purchased</span>
                    <span className="text-sky-400 font-bold">₹{course.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
