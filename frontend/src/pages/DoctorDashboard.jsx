import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import { LoadingSpinner, LoadingSkeleton, CardSkeleton } from '../components/LoadingComponents';
import { StatusBadge } from '../components/BadgeComponents';
import { DashboardCard, StatsCard, AppointmentCard } from '../components/CardComponents';
import { DashboardNav, DashboardHeader } from '../components/NavigationComponents';

function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState({
    specialty: '',
    experience: '',
    fee: ''
  });
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (user && !user.doctor) {
      navigate('/');
      return;
    }

    if (activeTab === 'appointments') fetchAppointments();
    else if (activeTab === 'profile') fetchProfile();
    else if (activeTab === 'availability') fetchAvailability();
  }, [activeTab, user, navigate]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments/doctor', { withCredentials: true });
      setAppointments(response.data);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      // Get doctor profile from user.doctor or fetch from API
      if (user.doctor) {
        setProfile({
          specialty: user.doctor.specialty || '',
          experience: user.doctor.experience || '',
          fee: user.doctor.fee || ''
        });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      // For now, just set some default availability
      setAvailability([
        { day: 'Monday', slots: ['09:00', '10:00', '14:00', '15:00'] },
        { day: 'Tuesday', slots: ['09:00', '10:00', '14:00', '15:00'] },
        { day: 'Wednesday', slots: ['09:00', '10:00', '14:00', '15:00'] },
        { day: 'Thursday', slots: ['09:00', '10:00', '14:00', '15:00'] },
        { day: 'Friday', slots: ['09:00', '10:00', '14:00', '15:00'] }
      ]);
    } catch (err) {
      console.error("Fetch availability error:", err);
      setError("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, { status }, { withCredentials: true });
      // Update local state
      setAppointments(appointments.map(app =>
        app.id === appointmentId ? { ...app, status } : app
      ));
      toast.success(`Appointment ${status.toLowerCase()} successfully!`);
    } catch (err) {
      console.error("Update status error:", err);
      toast.error("Failed to update appointment status");
    }
  };

  const updateProfile = async () => {
    try {
      await axios.put('http://localhost:5000/api/appointments/doctor/profile', profile, { withCredentials: true });
      setEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error("Failed to update profile");
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!user.doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Doctor privileges required.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'appointments', label: 'Appointments', icon: '📅', badge: appointments.filter(a => a.status === 'PENDING').length || null },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'availability', label: 'Availability', icon: '🕐' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={`Welcome back, Dr. ${user.name}!`}
        subtitle="Manage your appointments and profile"
        actions={
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Logout
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardNav
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-8"
        />

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Pending"
                value={appointments.filter(a => a.status === 'PENDING').length}
                icon="⏳"
                color="yellow"
                subtitle="Awaiting response"
              />
              <StatsCard
                title="Accepted"
                value={appointments.filter(a => a.status === 'ACCEPTED').length}
                icon="✅"
                color="green"
                subtitle="Confirmed appointments"
              />
              <StatsCard
                title="Rejected"
                value={appointments.filter(a => a.status === 'REJECTED').length}
                icon="❌"
                color="red"
                subtitle="Declined requests"
              />
              <StatsCard
                title="Cancelled"
                value={appointments.filter(a => a.status === 'CANCELLED').length}
                icon="🚫"
                color="gray"
                subtitle="Cancelled appointments"
              />
            </div>

            {/* Appointments List */}
            <DashboardCard
              title="My Appointments"
              actions={
                <button
                  onClick={fetchAppointments}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <span>🔄</span> Refresh
                </button>
              }
            >
              {loading ? (
                <div className="space-y-4">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                  <p className="text-gray-600">Your upcoming appointments will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onStatusUpdate={updateStatus}
                      userRole="doctor"
                    />
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <DashboardCard title="My Profile">
            <div className="max-w-md space-y-6">
              {!editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user.doctor?.specialty || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{user.doctor?.experience || 'Not specified'} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[60px]">{user.doctor?.bio || 'No bio available'}</p>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <input
                      type="text"
                      value={profile.specialty}
                      onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                    <input
                      type="number"
                      value={profile.experience}
                      onChange={(e) => setProfile({...profile, experience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell patients about your background and expertise..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </DashboardCard>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <DashboardCard title="My Availability">
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🕐</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Availability Management</h3>
                <p className="text-gray-600">Set your working hours and availability preferences.</p>
                <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
              </div>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;