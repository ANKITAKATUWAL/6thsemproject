import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
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

          {/* Login Button */}
          <Link
            to="/login"
            className="ml-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Login
          </Link>

        </div>
      </div>
    </nav>
  );
}
