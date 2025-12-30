import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    if (activeTab === 'stats') fetchStats();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'appointments') fetchAppointments();
  }, [activeTab, user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/stats', { withCredentials: true });
      setStats(response.data);
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
    } catch (err) {
      console.error("Update role error:", err);
      setError("Failed to update user role");
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/appointments/${appointmentId}/status`, { status }, { withCredentials: true });
      // Update local state
      setAppointments(appointments.map(app =>
        app.id === appointmentId ? { ...app, status } : app
      ));
    } catch (err) {
      console.error("Update status error:", err);
      setError("Failed to update appointment status");
    }
  };

  const createAdminForUser = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: 'ADMIN' }, { withCredentials: true });
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'ADMIN' } : u));
    } catch (err) {
      console.error("Create admin error:", err);
      setError("Failed to create admin");
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Please login to access admin dashboard.</p>;
  }

  if (user.role !== 'ADMIN') {
    return <p className="text-center mt-10 text-red-500">Access denied. Admin privileges required.</p>;
  }

  if (loading && activeTab === 'stats') return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

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
      <div className="flex space-x-4 mb-6 border-b">
        {[
          { id: 'stats', label: 'Statistics' },
          { id: 'users', label: 'Users' },
          { id: 'appointments', label: 'Appointments' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 px-4 ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Total Doctors</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalDoctors || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Total Appointments</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalAppointments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800">Pending Appointments</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingAppointments || 0}</p>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Doctor Profile</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        <option value="PATIENT">Patient</option>
                        <option value="DOCTOR">Doctor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      {user.doctor ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-2">
                      {!user.doctor && user.role === 'DOCTOR' && (
                        <button
                          onClick={() => createDoctorForUser(user.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 mr-2"
                        >
                          Create Doctor Profile
                        </button>
                      )}
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => createAdminForUser(user.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Make Admin
                        </button>
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
          <h2 className="text-2xl font-semibold mb-4">All Appointments</h2>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{appointment.patient.name}</h3>
                  <p className="text-gray-600">{appointment.patient.email}</p>
                  <p className="text-sm text-gray-500">
                    Doctor: {appointment.doctor.user.name} | {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.time}
                  </p>
                  {appointment.reason && <p className="text-sm">Reason: {appointment.reason}</p>}
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="space-x-2">
                  {appointment.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'ACCEPTED')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'REJECTED')}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED')}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
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