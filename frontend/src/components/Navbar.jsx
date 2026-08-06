import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { RiHome2Fill, RiDashboardFill } from 'react-icons/ri';
import { FaBookOpen, FaDownload, FaUserCircle } from 'react-icons/fa';
import { IoLogOut, IoLogIn } from 'react-icons/io5';
import { HiMenu, HiX } from 'react-icons/hi';

import { BACKEND_URL } from '../utils/utils.js';

const NAV_LINKS = [
  { to: '/',          icon: <RiHome2Fill />,     label: 'Home' },
  { to: '/dashboard', icon: <RiDashboardFill />, label: 'Dashboard' },
  { to: '/courses',   icon: <FaBookOpen />,      label: 'Courses' },
  { to: '/purchases', icon: <FaDownload />,      label: 'Purchases' },
];

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [user, setUser]               = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) { setIsLoggedIn(true); setUser(JSON.parse(stored)); }
    else        { setIsLoggedIn(false); setUser(null); }
  }, [location.pathname]);   // re-check on every route change

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

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
      isActive(path)
        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* ── TOP NAVBAR (md+) ─────────────────────────────────────── */}
      <nav className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/10 sticky top-0 z-40 bg-black/40 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-9 w-auto rounded-full" />
          <span className="text-xl font-semibold">
            <span className="bg-linear-to-l from-sky-500 to-blue-800 bg-clip-text text-transparent">Skill</span>
            <span className="text-white">Harbor</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, icon, label }) => (
            <Link key={to} to={to} className={linkClass(to)}>
              <span className="text-base">{icon}</span>{label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <FaUserCircle className="text-sky-400 text-xl" />
                <span className="text-sm text-gray-300">{user?.email?.split('@')[0] ?? 'User'}</span>
              </div>
              <button
                onClick={handleLogOut}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <IoLogOut /> Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-white border border-white/20 hover:border-sky-500 px-4 py-2 rounded-xl transition-all duration-200">Login</Link>
              <Link to="/signup" className="flex items-center gap-2 text-sm bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl transition-colors duration-200">Signup</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── MOBILE HEADER ────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/10 sticky top-0 z-40 bg-black/60 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto rounded-full" />
          <span className="font-semibold">
            <span className="bg-linear-to-l from-sky-500 to-blue-800 bg-clip-text text-transparent">Skill</span>
            <span className="text-white">Harbor</span>
          </span>
        </Link>
        <button onClick={() => setSidebarOpen(true)} className="text-white p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <HiMenu className="text-2xl" />
        </button>
      </div>

      {/* ── OVERLAY ──────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR DRAWER (mobile) ───────────────────────────────── */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-950 border-r border-white/10 z-50 flex flex-col p-6 transition-transform duration-300 md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <img src="/logo.png" alt="Logo" className="h-9 w-auto rounded-full" />
            <span className="font-semibold text-lg">
              <span className="bg-linear-to-l from-sky-500 to-blue-800 bg-clip-text text-transparent">Skill</span>
              <span className="text-white">Harbor</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white p-1">
            <HiX className="text-2xl" />
          </button>
        </div>

        {isLoggedIn && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6">
            <FaUserCircle className="text-sky-400 text-3xl shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">{user?.email?.split('@')[0] ?? 'User'}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_LINKS.map(({ to, icon, label }) => (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)} className={linkClass(to)}>
              <span className="text-base">{icon}</span>{label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-white/10 pt-4 flex flex-col gap-2">
          {isLoggedIn ? (
            <button
              onClick={() => { setSidebarOpen(false); handleLogOut(); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              <IoLogOut /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white border border-white/20 hover:border-sky-500 text-sm font-medium transition-all duration-200 justify-center">
                <IoLogIn /> Login
              </Link>
              <Link to="/signup" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium transition-all duration-200 justify-center">
                Signup
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
