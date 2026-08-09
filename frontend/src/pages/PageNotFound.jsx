import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function PageNotFound() {
  return (
    <div className="bg-linear-to-r from-black to-blue-950 min-h-screen text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="max-w-3xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 text-center">
          <img src="/logo.png" alt="SkillHarbor logo" className="mx-auto w-28 h-28 object-contain mb-6" />
          <h1 className="text-5xl sm:text-6xl font-extrabold text-sky-400 mb-4">404</h1>
          <p className="text-xl sm:text-2xl font-semibold text-white mb-3">Page Not Found</p>
          <p className="text-gray-400 mb-6">Sorry — the page you're looking for doesn't exist or has been moved.</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-5 py-2.5 rounded-full font-semibold transition-colors">
              Home
            </Link>
            <Link to="/courses" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-sky-400 px-5 py-2.5 rounded-full font-semibold border border-sky-400/20 transition-colors">
              Browse Courses
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 text-gray-300 underline-offset-2 hover:underline px-3 py-2">
              Login
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            If you think this is an error, contact support at <a href="mailto:support@skillharbor.example" className="text-sky-400 hover:underline">support@skillharbor.example</a>
          </div>
        </div>
      </main>
    </div>
  );
}
