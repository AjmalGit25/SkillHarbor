import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiBookOpen, FiEdit3, FiHome, FiLogOut, FiPlusCircle, FiStar, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import { BACKEND_URL } from "../utils/utils.js";

const navItems = [
  { to: "/admin/dashboard", label: "Home", icon: FiHome, color: "from-orange-500 to-amber-400" },
  { to: "/admin/our-courses", label: "Your Courses", icon: FiBookOpen, color: "from-emerald-500 to-green-400" },
  { to: "/admin/create-course", label: "Create Course", icon: FiPlusCircle, color: "from-sky-500 to-cyan-400" },
];

export default function OurCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const navigate = useNavigate();

  const adminData = JSON.parse(localStorage.getItem("admin") || "null");
  const admin = adminData.admin;
  const token = adminData?.token;

  useEffect(() => {
    if (!token) {
      toast.error("Please login to admin");
      navigate("/admin/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/course/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        console.log("Error while fetching courses: ", error);
        toast.error("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate, token]);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/course/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success(response.data.message || "Course deleted");
      setCourses((prev) => prev.filter((course) => course._id !== id));
    } catch (error) {
      console.log("Error in deleting course ", error);
      toast.error(error?.response?.data?.errors || "Error in deleting course");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem("admin");
      toast.success(response.data.message || "Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error?.response?.data?.errors || "Error in logging out");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.20),transparent_30%),linear-gradient(135deg,#020617_0%,#111827_50%,#0f172a_100%)] text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-slate-950/70 p-5 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 text-xl font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm text-slate-400">Welcome back</p>
              <h2 className="text-lg font-semibold text-white">{admin?.firstName || "Admin"}</h2>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
            <p className="text-sm font-medium text-orange-300">SkillHarbor Admin</p>
            <p className="mt-1 text-sm text-slate-300">Manage your course catalog and content library.</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map(({ to, label, icon: Icon, color }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${to === "/admin/our-courses"
                  ? "border-orange-400/40 bg-linear-to-r from-orange-500/20 to-amber-400/10 text-white shadow-lg shadow-orange-500/10"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
              >
                <span className={`rounded-lg bg-linear-to-r ${color} p-2 text-white`}>
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </Link>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
            >
              <span className="rounded-lg bg-red-500/80 p-2 text-white">
                <FiLogOut className="h-4 w-4" />
              </span>
              Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <header className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-sm text-orange-300">
                  <FiStar className="h-4 w-4" />
                  Course Library
                </div>
                <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Our Courses</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                  Review, update, and manage your published courses from one place.
                </p>
              </div>

              <Link
                to="/admin/create-course"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:scale-[1.01]"
              >
                <FiPlusCircle />
                Create New Course
              </Link>
            </div>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/20">
                  <div className="h-40 rounded-2xl bg-slate-800" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-slate-800" />
                  <div className="mt-3 h-3 w-full rounded bg-slate-800" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-slate-800" />
                  <div className="mt-5 flex gap-2">
                    <div className="h-10 flex-1 rounded-xl bg-slate-800" />
                    <div className="h-10 flex-1 rounded-xl bg-slate-800" />
                  </div>
                </div>
              ))
            ) : courses.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-slate-900/70 p-10 text-center text-slate-400">
                No courses found yet. Create your first course to get started.
              </div>
            ) : (
              courses.map((course) => (
                <div key={course._id} className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl shadow-black/20">
                  <div className="relative h-44 overflow-hidden">
                    {course?.image?.url ? (
                      <img
                        src={course.image.url}
                        alt={course.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-500/20 to-sky-500/20 text-slate-400">
                        No thumbnail
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full border border-orange-400/30 bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300">
                      {course.price !== 0 ? `₹${course.price}` : "Free"}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold text-white">{course.title}</h2>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                        Published
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-400 line-clamp-3">
                      {course.description || "A polished course ready to be discovered by learners."}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
                      <span>Updated content</span>
                      <span>{course.price !== 0 ? "Premium" : "Free"}</span>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <Link
                        to={`/admin/update-course/${course._id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        <FiEdit3 className="h-4 w-4" />
                        Update
                      </Link>
                      <button
                        onClick={() => setCourseToDelete(course)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </div>

      {/* Delete Course Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 mb-4">
              <FiTrash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Delete Course?</h3>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete <span className="font-medium text-white">&ldquo;{courseToDelete.title}&rdquo;</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCourseToDelete(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => { handleDelete(courseToDelete._id); setCourseToDelete(null); }}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
