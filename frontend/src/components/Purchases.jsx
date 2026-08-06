import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaDownload, FaBookOpen } from 'react-icons/fa';
import Navbar from './Navbar';

import { BACKEND_URL } from '../utils/utils.js';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { setError('Please login to view your purchases.'); setLoading(false); return; }

    const token = JSON.parse(stored).token;
    const fetchPurchases = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/user/purchases`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setPurchases(res.data.courseData);
      } catch (err) {
        toast.error('Failed to fetch purchases.');
        setError('Failed to load your purchases. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-10">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-sky-500/20 border border-sky-500/30 p-2.5 rounded-xl">
            <FaDownload className="text-sky-400 text-lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Purchases</h1>
        </div>
        <p className="text-gray-400 text-sm mb-10 ml-1">All the courses you've enrolled in, in one place.</p>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-52">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-5xl mb-4">🔒</p>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link to="/login" className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-full font-semibold transition-colors duration-200">
              Login
            </Link>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && purchases.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-400 mb-2 text-lg font-medium">No purchases yet</p>
            <p className="text-gray-500 text-sm mb-6">Explore our courses and start learning today.</p>
            <Link to="/courses" className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-full font-semibold transition-colors duration-200">
              Browse Courses
            </Link>
          </div>
        )}

        {/* Purchases count badge */}
        {!loading && !error && purchases.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold px-3 py-1 rounded-full">
                {purchases.length} course{purchases.length !== 1 ? 's' : ''} purchased
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {purchases.map((course, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-sky-500/50 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative">
                    <img
                      src={course.image?.url || '/logo.png'}
                      alt={course.title}
                      className="w-full h-44 object-cover"
                    />
                    {/* Purchased badge */}
                    <span className="absolute top-3 left-3 flex items-center gap-1 bg-green-500/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      ✓ Purchased
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-white font-bold text-base mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">{course.description}</p>

                    {/* Footer row */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-sky-400 font-bold text-lg">₹{course.price}</span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">
                        <FaBookOpen className="text-sky-400" />
                        Enrolled
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
