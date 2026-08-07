import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import './App.css';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe("pk_test_51THTwWK8kgtlHxktjwBz25Y42GjoeOoMUWDMlKDlYIqCyQQ9RMVCFRbbFB1zcKlirPXqfxmzcdzN2LmZK0SFf7Jn00L64A19WM");

// User Pages
import Home from './pages/user/Home.jsx';
import Login from './pages/user/Login.jsx';
import Signup from "./pages/user/Signup.jsx"
import Courses from './pages/user/Courses.jsx';
import Purchases from './pages/user/Purchases.jsx';
import Buy from './pages/user/Buy.jsx';
import Dashboard from './pages/user/Dashboard.jsx';

// Admin Pages
import AdminSignup from './pages/admin/AdminSignup.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CourseCreate from './pages/admin/CourseCreate.jsx';
import OurCourses from './pages/admin/OurCourses.jsx';
import UpdateCourse from './pages/admin/UpdateCourse.jsx';


const ProtectedUser  = ({ children }) => localStorage.getItem('user')  ? children : <Navigate to="/login" />;
const ProtectedAdmin = ({ children }) => localStorage.getItem('admin') ? children : <Navigate to="/admin/login" />;

const router = createBrowserRouter([
  {
    path: "/", element: <App />,

    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/courses", element: <Courses /> },
    ]
  },

  // Other routes
  { path: "/courses", element: <Courses /> },
  { path: "/buy/:courseId", element: <Buy /> },
  { path: "/purchases", element: <ProtectedUser><Purchases /></ProtectedUser> },
  { path: "/dashboard", element: <ProtectedUser><Dashboard /></ProtectedUser> },

  // Admin routes
  { path: "/admin/signup", element: <AdminSignup /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/dashboard", element: <ProtectedAdmin><AdminDashboard /></ProtectedAdmin> },
  { path: "/admin/create-course", element: <ProtectedAdmin><CourseCreate /></ProtectedAdmin> },
  { path: "/admin/our-courses", element: <ProtectedAdmin><OurCourses /></ProtectedAdmin> },
  { path: "/admin/update-course/:courseId", element: <ProtectedAdmin><UpdateCourse /></ProtectedAdmin> },
]);

createRoot(document.getElementById('root')).render(
  <>
    <Elements stripe={stripePromise}>
      <Toaster />        {/* ✅ Global */}
      <RouterProvider router={router} />
    </Elements>
  </>
);
