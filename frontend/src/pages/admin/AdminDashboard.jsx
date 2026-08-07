import axios from "axios";
import toast from "react-hot-toast";
import { FiBookOpen, FiHome, FiLogOut, FiPlusCircle, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BACKEND_URL } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/admin/dashboard", label: "Home", icon: FiHome, active: true, color: "from-orange-500 to-amber-400" },
  { to: "/admin/our-courses", label: "Our Courses", icon: FiBookOpen, color: "from-emerald-500 to-green-400" },
  { to: "/admin/create-course", label: "Create Course", icon: FiPlusCircle, color: "from-sky-500 to-cyan-400" },
];

export default function AdminDashboard() {
  const adminData = JSON.parse(localStorage.getItem("admin") || "null");
  const admin = adminData.admin;

  const navigate = useNavigate();

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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 text-xl font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm text-slate-400">Welcome back</p>
              <h2 className="text-lg font-semibold text-white">{admin?.firstName || "Admin"}</h2>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
            <p className="text-sm font-medium text-orange-300">SkillHarbor Admin</p>
            <p className="mt-1 text-sm text-slate-300">Manage courses, modules, and lessons from one place.</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map(({ to, label, icon: Icon, color, active }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${active
                  ? "border-orange-400/40 bg-gradient-to-r from-orange-500/20 to-amber-400/10 text-white shadow-lg shadow-orange-500/10"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                  }`}
              >
                <span className={`rounded-lg bg-gradient-to-r ${color} p-2 text-white`}>
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
                  Admin Control Center
                </div>
                <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                  Welcome back,
                  <span className="text-orange-600 ml-2">{admin.firstName + " " + admin.lastName || "Admin"}</span>!
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                  Create new courses, manage your content library, and keep your learning platform up to date.
                </p>
              </div>

              <Link
                to="/admin/create-course"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-400 px-4 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:scale-[1.01]"
              >
                <FiPlusCircle />
                Create New Course
              </Link>
            </div>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-slate-400">Courses</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Manage</h3>
              <p className="mt-2 text-sm text-slate-400">Review, update, and publish your course catalog.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-slate-400">Modules</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Organize</h3>
              <p className="mt-2 text-sm text-slate-400">Structure lessons clearly with engaging course modules.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-slate-400">Students</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Engage</h3>
              <p className="mt-2 text-sm text-slate-400">Keep your learners progressing with polished content.</p>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                <p className="mt-1 text-sm text-slate-400">Jump right into the most common admin tasks.</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/admin/create-course" className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4 transition hover:bg-orange-500/20">
                <p className="font-semibold text-white">Create a new course</p>
                <p className="mt-1 text-sm text-slate-300">Start building a fresh learning experience with a guided flow.</p>
              </Link>
              <Link to="/admin/our-courses" className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 transition hover:bg-emerald-500/20">
                <p className="font-semibold text-white">View all courses</p>
                <p className="mt-1 text-sm text-slate-300">Review and manage your full course catalog in one place.</p>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
