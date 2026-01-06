import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Cookies from 'js-cookie';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [role, setRole] = useState('PATIENT');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (e) => setRole(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // include requested role for server-side auth (server may ignore but it's sent)
      console.log('Submitting login', { formData, role });
      const response = await authService.login({ ...formData, role });
      console.log('Login response:', response);

      // basic validation of server response
      if (!response || !response.user) {
        console.error('Invalid login response', response);
        toast.error('Login failed: invalid server response');
        setLoading(false);
        return;
      }

      // Detect server role and enforce that selected role matches it
      const userEmail = (response.user?.email || '').toLowerCase();
      const serverRole = (response.user?.role || '').toString().toUpperCase();

      // If server provided a role, require the admin to select the same role
      if (serverRole) {
        // Special-case admin email: treat as ADMIN on server
        if (userEmail === 'admin@example.com' && role !== 'ADMIN') {
          toast.error('This account is an admin account — please select Admin and try again.');
          setLoading(false);
          return;
        }

        if (serverRole !== role) {
          toast.error(`Selected role does not match account role (${serverRole}). Please select the correct role.`);
          setLoading(false);
          return;
        }
      }

      const clientUser = { ...response.user };
      // If serverRole exists, prefer it; otherwise fall back to selected role
      clientUser.role = serverRole || role;

      // store token if returned
      if (response.token) {
        Cookies.set('token', response.token, { expires: 7 });
      }

      login(clientUser);
      localStorage.setItem('role', (clientUser.role || '').toString().toUpperCase());

      // Redirect based on resolved role
      const resolvedRole = (clientUser.role || '').toString().toUpperCase();
      if (resolvedRole === 'ADMIN') {
        toast.success('Admin login successful!');
        navigate('/admin-dashboard');
      } else if (resolvedRole === 'DOCTOR' || clientUser.doctor) {
        toast.success('Doctor login successful!');
        navigate('/doctor-dashboard');
      } else {
        toast.success('Login successful!');
        navigate('/my-dashboard');
      }
    } catch (error) {
      console.error('Login error caught:', error);
      // Show detailed error in toast and console to help debugging
      const serverMessage = error?.response?.data?.message;
      const status = error?.response?.status;
      if (serverMessage) {
        toast.error(`Login failed: ${serverMessage}`);
      } else if (status) {
        toast.error(`Login failed: HTTP ${status}`);
      } else if (error?.message) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.error('Login failed: unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-50 px-4">

      {/* Login Card */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-md lg:max-w-md bg-white rounded-xl shadow-lg p-8 sm:p-10 border border-gray-200">

        {/* Logo / Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-600 mb-2">
          MediCare Login
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm sm:text-base">
          Login to access your account (Patient, Doctor, or Admin)
        </p>

        {/* Role Selector */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-blue-800 mb-2">Sign in as</label>
          <select value={role} onChange={handleRoleChange} className="w-full p-3 border border-gray-300 rounded-lg">
            <option value="PATIENT">User</option>
            <option value="DOCTOR">Doctor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 sm:py-3 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium
                       hover:bg-blue-700 transition-shadow shadow-md disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Register link */}
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
