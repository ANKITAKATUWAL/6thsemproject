import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  });
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    if (activeTab === 'overview') fetchStats();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'doctors') fetchDoctors();
    else if (activeTab === 'appointments') fetchAppointments();
  }, [activeTab, user, navigate]);

  const fetchStats = async () => {
    try {
      const [usersRes, doctorsRes, appointmentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/users', { withCredentials: true }),
        axios.get('http://localhost:5000/api/admin/doctors', { withCredentials: true }),
        axios.get('http://localhost:5000/api/admin/appointments', { withCredentials: true })
      ]);

      setStats({
        totalUsers: usersRes.data.length,
        totalDoctors: doctorsRes.data.length,
        totalAppointments: appointmentsRes.data.length,
        pendingAppointments: appointmentsRes.data.filter(a => a.status === 'PENDING').length
      });
    } catch (err) {
      console.error("Fetch stats error:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', { withCredentials: true });
      setUsers(response.data);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/doctors', { withCredentials: true });
      setDoctors(response.data);
    } catch (err) {
      console.error("Fetch doctors error:", err);
      setError("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/appointments', { withCredentials: true });
      setAppointments(response.data);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole }, { withCredentials: true });
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (err) {
      console.error("Update role error:", err);
      toast.error("Failed to update user role");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, { withCredentials: true });
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      console.error("Delete user error:", err);
      toast.error("Failed to delete user");
    }
  };

  const approveDoctor = async (doctorId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/doctors/${doctorId}/approve`, {}, { withCredentials: true });
      setDoctors(doctors.map(d => d.id === doctorId ? { ...d, approved: true } : d));
      toast.success('Doctor approved successfully');
    } catch (err) {
      console.error("Approve doctor error:", err);
      toast.error("Failed to approve doctor");
    }
  };

  const rejectDoctor = async (doctorId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/doctors/${doctorId}/reject`, {}, { withCredentials: true });
      setDoctors(doctors.map(d => d.id === doctorId ? { ...d, approved: false } : d));
      toast.success('Doctor rejected');
    } catch (err) {
      console.error("Reject doctor error:", err);
      toast.error("Failed to reject doctor");
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, { status }, { withCredentials: true });
      setAppointments(appointments.map(a => a.id === appointmentId ? { ...a, status } : a));
      toast.success(`Appointment ${status.toLowerCase()} successfully`);
    } catch (err) {
      console.error("Update appointment error:", err);
      toast.error("Failed to update appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Please login to access admin dashboard.</p>;
  }

  if (user.role !== 'ADMIN') {
    return <p className="text-center mt-10 text-red-500">Access denied. Admin privileges required.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6 border-b overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'users', label: '👥 Users' },
          { id: 'doctors', label: '👨‍⚕️ Doctors' },
          { id: 'appointments', label: '📅 Appointments' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
            <div className="text-blue-800 font-medium">Total Users</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalDoctors}</div>
            <div className="text-green-800 font-medium">Total Doctors</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalAppointments}</div>
            <div className="text-purple-800 font-medium">Total Appointments</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingAppointments}</div>
            <div className="text-yellow-800 font-medium">Pending Appointments</div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">User Management</h2>
            <button
              onClick={fetchUsers}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="PATIENT">Patient</option>
                        <option value="DOCTOR">Doctor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctors Tab */}
      {activeTab === 'doctors' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Doctor Management</h2>
            <button
              onClick={fetchDoctors}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Specialty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Experience</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fee</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{doctor.user.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{doctor.user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doctor.specialty || 'Not set'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doctor.experience || 'Not set'} years</td>
                    <td className="px-4 py-3 text-sm text-gray-500">${doctor.fee || 'Not set'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doctor.approved ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      {!doctor.approved ? (
                        <>
                          <button
                            onClick={() => approveDoctor(doctor.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectDoctor(doctor.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-green-600 font-medium">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">All Appointments</h2>
            <button
              onClick={fetchAppointments}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Refresh
            </button>
          </div>

          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">👤 {appointment.patient.name}</h3>
                        <p className="text-gray-600">{appointment.patient.email}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">👨‍⚕️ {appointment.doctor.user.name}</h3>
                        <p className="text-gray-600">{appointment.doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span>📅 {new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                      <span>🕐 {appointment.time}</span>
                    </div>
                    {appointment.reason && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status === 'PENDING' && '⏳ '}
                        {appointment.status === 'ACCEPTED' && '✅ '}
                        {appointment.status === 'REJECTED' && '❌ '}
                        {appointment.status === 'CANCELLED' && '🚫 '}
                        {appointment.status}
                      </span>
                    </div>

                    <div className="space-x-2">
                      {appointment.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'ACCEPTED')}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'REJECTED')}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {appointment.status === 'ACCEPTED' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED')}
                          className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;