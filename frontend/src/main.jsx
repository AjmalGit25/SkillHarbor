import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import './App.css';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import Buy from './components/Buy.jsx';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe("pk_test_51THTwWK8kgtlHxktjwBz25Y42GjoeOoMUWDMlKDlYIqCyQQ9RMVCFRbbFB1zcKlirPXqfxmzcdzN2LmZK0SFf7Jn00L64A19WM");

// User Pages
import Home from './components/Home.jsx';
import Login from './components/Login.jsx';
import Signup from "./components/Signup.jsx"
import Courses from './components/Courses.jsx';
import Purchases from './components/Purchases.jsx';

// Admin Pages
import AdminSignup from './admin/AdminSignup.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import CourseCreate from './admin/CourseCreate.jsx';
import OurCourses from './admin/OurCourses.jsx';
import UpdateCourse from './admin/UpdateCourse.jsx';

const user = JSON.parse(localStorage.getItem("user"));
const admin = JSON.parse(localStorage.getItem("admin"));

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
  { path: "/purchases", element: user ? <Purchases /> : <Navigate to="/login" />},

  // Admin routes
  { path: "/admin/signup", element: <AdminSignup /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/dashboard", element: admin ? <AdminDashboard /> : <Navigate to="/admin/login" /> },
  { path: "/admin/create-course", element: <CourseCreate /> },
  { path: "/admin/our-courses", element: <OurCourses /> },
  { path: "/admin/update-course/:courseId", element: <UpdateCourse /> },
]);

createRoot(document.getElementById('root')).render(
  <>
    <Elements stripe={stripePromise}>
      <Toaster />        {/* ✅ Global */}
      <RouterProvider router={router} />
    </Elements>
  </>
);
