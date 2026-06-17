import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
// import { BACKEND_URL } from "../utils/utils";

export default function AdminDashboard() {
  const handleLogout = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/logout`, {
        withCredentials: true,
      });
      localStorage.removeItem("admin");
      toast.success(response.data.message);
    } catch (error) {
      console.log("Error in logging out ", error);
      toast.error(error.response.data.errors || "Error in logging out");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-5">
        <div className="flex items-center flex-col mb-10">
          <img src="../public/logo.png" alt="logo" className="rounded-full h-15 w-15" />
          <h2 className="text-lg font-semibold mt-4">I'm Admin</h2>
        </div>
        <nav className="flex flex-col space-y-4">
          <Link to="/admin/our-courses"
            className="w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded text-center">
            Our Courses
          </Link>
          <Link to="/admin/create-course" className="w-full bg-orange-500 hover:bg-blue-600 text-white py-2 rounded text-center">
            Create Course

          </Link>

          <Link to="/admin/dashboard"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded text-center">
            Home

          </Link>
          <Link to="/admin/login"
            onClick={handleLogout}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded text-center"
          >
            Logout
          </Link>
        </nav>
      </div>
      <div className="flex h-screen items-center justify-center ml-[40%]">
        Welcome!!!
      </div>
    </div>
  );
}
