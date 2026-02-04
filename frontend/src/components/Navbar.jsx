import { Link, NavLink } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 shadow-lg border-b rounded-b-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-8 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-3xl font-extrabold text-white tracking-wide drop-shadow-lg hover:scale-105 transition-transform duration-300">
          <span className="inline-block bg-white rounded-full p-2 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          MediCare
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-10 text-white font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-yellow-300 font-bold underline underline-offset-4 scale-105 transition-transform duration-200"
                : "hover:text-yellow-200 hover:scale-105 transition-transform duration-200"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/doctors"
            className={({ isActive }) =>
              isActive
                ? "text-yellow-300 font-bold underline underline-offset-4 scale-105 transition-transform duration-200"
                : "hover:text-yellow-200 hover:scale-105 transition-transform duration-200"
            }
          >
            Doctors
          </NavLink>

          {(user?.role === 'DOCTOR' || user?.doctor) && (
            <NavLink
              to="/doctor-dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-bold underline underline-offset-4 scale-105 transition-transform duration-200"
                  : "hover:text-yellow-200 hover:scale-105 transition-transform duration-200"
              }
            >
              Doctor Dashboard
            </NavLink>
          )}

          {user?.role === 'PATIENT' && (
            <NavLink
              to="/my-dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-bold underline underline-offset-4 scale-105 transition-transform duration-200"
                  : "hover:text-yellow-200 hover:scale-105 transition-transform duration-200"
              }
            >
              My Dashboard
            </NavLink>
          )}

          {user?.role === 'ADMIN' && (
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-yellow-300 font-bold underline underline-offset-4 scale-105 transition-transform duration-200"
                  : "hover:text-yellow-200 hover:scale-105 transition-transform duration-200"
              }
            >
              Admin Dashboard
            </NavLink>
          )}

          {/* Auth Buttons */}
          {user ? (
            <button
              onClick={handleLogout}
              className="ml-6 bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-2 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-200 font-semibold shadow-md border border-red-400"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-200 font-semibold shadow-md border border-blue-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-green-500 to-green-400 text-white px-6 py-2 rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-200 font-semibold shadow-md border border-green-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
