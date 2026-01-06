import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import Cookies from 'js-cookie';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
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
      // include selected role in registration payload
      const payload = { ...formData, role };
      const response = await authService.register(payload);

      // store token if returned
      if (response.token) {
        Cookies.set('token', response.token, { expires: 7 });
      }

      const registeredUser = { ...response.user };
      if (!registeredUser.role) registeredUser.role = role;
      login(registeredUser);
      localStorage.setItem('role', (registeredUser.role || '').toString().toUpperCase());

      // Redirect similar to login behavior
      const r = (registeredUser.role || '').toString().toUpperCase();
      if (r === 'ADMIN') {
        toast.success('Admin registered and logged in');
        navigate('/admin-dashboard');
      } else if (r === 'DOCTOR' || registeredUser.doctor) {
        toast.success('Doctor registered and logged in');
        navigate('/doctor-dashboard');
      } else {
        toast.success('Registration successful!');
        navigate('/my-dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
            <select value={role} onChange={handleRoleChange} className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="PATIENT">User</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </div>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
