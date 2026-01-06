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
    <nav className="fixed top-0 w-full z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          MediCare
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-12 text-gray-700 font-medium">

          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-600 transition"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/doctors"
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-600 transition"
            }
          >
            Doctors
          </NavLink>

          {(user?.role === 'DOCTOR' || user?.doctor) && (
            <NavLink
              to="/doctor-dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600 transition"
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
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600 transition"
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
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600 transition"
              }
            >
              Admin Dashboard
            </NavLink>
          )}

          {/* Auth Buttons */}
          {user ? (
            <button
              onClick={handleLogout}
              className="ml-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition shadow-md"
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
