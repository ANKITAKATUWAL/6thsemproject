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
    fee: '',
    bio: '',
    photo: ''
  });
  const [profileExists, setProfileExists] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [availabilityState, setAvailabilityState] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user && !(user.role === 'DOCTOR' || user.doctor)) {
      navigate('/');
      return;
    }

    // Fetch appointments and availability as before
    if (activeTab === 'appointments') fetchAppointments();
    else if (activeTab === 'availability') fetchAvailability();
  }, [activeTab, user, navigate]);

  // Always fetch profile on load (use logged-in user id)
  useEffect(() => {
    if (!user) return;
    fetchProfile();
  }, [user]);

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
      // Try to fetch the profile from server (do not auto-create)
      const res = await axios.get('http://localhost:5000/api/appointments/doctor/profile', { withCredentials: true });
      const d = res.data;
      setProfile({
        specialty: d.specialty || '',
        experience: d.experience || '',
        fee: d.fee || '',
        bio: d.about || '',
        photo: d.photo || ''
      });
      // Set photo preview if photo exists
      if (d.photo) {
        const photoUrl = d.photo.startsWith('http') ? d.photo : `http://localhost:5000${d.photo}`;
        setPhotoPreview(photoUrl);
      }
      setProfileExists(true);
    } catch (err) {
      if (err?.response?.status === 404) {
        // Profile missing
        setProfileExists(false);
        setProfile({ specialty: '', experience: '', fee: '', bio: '', photo: '' });
      } else {
        console.error("Fetch profile error:", err);
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments/doctor/availability', { withCredentials: true });
      setAvailabilityState(res.data);
      // use timeSlots only if provided by server; do not fall back to hardcoded slots
      setAvailability(res.data?.timeSlots?.length ? res.data.timeSlots : []);
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

  const openPatientDetails = async (patientId) => {
    if (!patientId) return;
    try {
      setLoadingPatient(true);
      const res = await axios.get(`http://localhost:5000/api/appointments/patient/${patientId}`, { withCredentials: true });
      setPatientDetails(res.data);
      setPatientModalOpen(true);
    } catch (err) {
      console.error('Fetch patient details error:', err);
      toast.error('Failed to load patient details');
    } finally {
      setLoadingPatient(false);
    }
  };

  const saveAvailability = async (payload) => {
    try {
      const res = await axios.put('http://localhost:5000/api/appointments/doctor/availability', payload, { withCredentials: true });
      setAvailabilityState(res.data);
      toast.success('Availability updated');
    } catch (err) {
      console.error('Save availability error:', err);
      toast.error('Failed to save availability');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) {
      toast.error('Please select a photo first');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await axios.post(
        'http://localhost:5000/api/appointments/doctor/photo',
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      setProfile(prev => ({ ...prev, photo: response.data.photo }));
      setPhotoFile(null);
      toast.success('Photo uploaded successfully!');
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error(err?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
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

  if (!(user.role === 'DOCTOR' || user.doctor)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Doctor privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'appointments', label: 'Appointments', icon: '📅', badge: appointments.filter(a => a.status === 'PENDING').length || null },
    { id: 'profile', label: 'My Profile', icon: '👤' },
    { id: 'availability', label: 'Schedule', icon: '🕐' }
  ];

  // Derived stats
  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter(a => {
    try {
      const d = new Date(a.appointmentDate);
      const today = new Date();
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
    } catch (e) {
      return false;
    }
  }).length;
  const pendingRequests = appointments.filter(a => (a.status || '').toUpperCase() === 'PENDING').length;
  const acceptedAppointments = appointments.filter(a => (a.status || '').toUpperCase() === 'ACCEPTED').length;

  const specialty = user.doctor?.specialty || profile.specialty || 'Not specified';
  const experience = user.doctor?.experience || profile.experience || '—';
  const fee = user.doctor?.fee || profile.fee || '—';

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Doctor Avatar */}
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-3 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-3 border-white/30">
                    <span className="text-3xl">👨‍⚕️</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-blue-100 text-sm">{getGreeting()}</p>
                <h1 className="text-2xl font-bold">Dr. {user.name}</h1>
                <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full">{specialty}</span>
                  <span>•</span>
                  <span>{experience} yrs exp</span>
                  {fee !== '—' && (
                    <>
                      <span>•</span>
                      <span className="font-semibold">Rs. {fee}/visit</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 border border-white/20"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 -mt-8">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-gray-800">{totalAppointments}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Today</p>
                <p className="text-2xl font-bold text-gray-800">{todayAppointments}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{pendingRequests}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Accepted</p>
                <p className="text-2xl font-bold text-gray-800">{acceptedAppointments}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md p-1.5 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <span className="mr-2 text-lg">{tab.icon}</span>
                {tab.label}
                {tab.badge && (
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Appointments List - Only show appointments for this doctor */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">My Appointments</h2>
                    <p className="text-blue-100 text-sm">Patients who have booked with you</p>
                  </div>
                  <button
                    onClick={fetchAppointments}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    <span>🔄</span> Refresh
                  </button>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                ) : (() => {
                  const doctorAppointments = appointments.filter(a => a.doctorId === user.id);
                  if (doctorAppointments.length === 0) {
                    return (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-4xl">📅</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Your upcoming appointments will appear here when patients book with you.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-4">
                      {doctorAppointments.map((appointment) => (
                        <div key={appointment.id} className={`bg-white border rounded-xl p-5 hover:shadow-lg transition-all duration-200 ${
                          (appointment.status || '').toUpperCase() === 'PENDING' ? 'border-l-4 border-l-yellow-400 border-yellow-100' :
                          ['APPROVED','ACCEPTED'].includes((appointment.status || '').toUpperCase()) ? 'border-l-4 border-l-green-400 border-green-100' :
                          (appointment.status || '').toUpperCase() === 'COMPLETED' ? 'border-l-4 border-l-blue-400 border-blue-100' :
                          'border-l-4 border-l-gray-400 border-gray-100'
                        }`}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xl">👤</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{appointment.patient?.name}</h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    (appointment.status || '').toUpperCase() === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    ['APPROVED','ACCEPTED'].includes((appointment.status || '').toUpperCase()) ? 'bg-green-100 text-green-700' :
                                    (appointment.status || '').toUpperCase() === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {appointment.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    <span>📅</span> {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    <span>🕐</span> {appointment.time}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 md:items-end">
                              {String(appointment.status).trim().toLowerCase() === 'pending' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => updateStatus(appointment.id, 'APPROVED')}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow flex items-center gap-1"
                                  >
                                    <span>✓</span> Accept
                                  </button>
                                  <button
                                    onClick={() => updateStatus(appointment.id, 'REJECTED')}
                                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow flex items-center gap-1"
                                  >
                                    <span>✕</span> Reject
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => openPatientDetails(appointment.patientId)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1"
                              >
                                View Patient Details →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">My Profile</h2>
              <p className="text-blue-100 text-sm">Manage your professional information</p>
            </div>
            
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                {!editingProfile ? (
                  <div className="space-y-6">
                    {!profileExists && (
                      <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">⚠️</span>
                          <div>
                            <p className="text-yellow-800 font-semibold">Complete Your Profile</p>
                            <p className="text-sm text-yellow-700 mt-1">Add your professional details to start receiving appointments from patients.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Profile Photo Display */}
                    <div className="flex flex-col items-center py-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                      ) : (
                        <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-white shadow-xl">
                          <span className="text-gray-400 text-5xl">👨‍⚕️</span>
                        </div>
                      )}
                      <h3 className="mt-4 text-xl font-bold text-gray-900">Dr. {user.name}</h3>
                      <p className="text-gray-500">{profile.specialty || 'Specialty not set'}</p>
                    </div>

                    {/* Profile Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                        <p className="text-gray-900 font-semibold">{user.name}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email Address</label>
                        <p className="text-gray-900 font-semibold">{user.email}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Specialty</label>
                        <p className="text-gray-900 font-semibold">{profile.specialty || 'Not specified'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Experience</label>
                        <p className="text-gray-900 font-semibold">{profile.experience || '0'} years</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Consultation Fee</label>
                        <p className="text-gray-900 font-semibold text-green-600">{profile.fee ? `Rs. ${profile.fee}` : 'Not set'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</label>
                        <p className="text-green-600 font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span> Active
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Professional Bio</label>
                      <p className="text-gray-700 leading-relaxed">{profile.bio || 'No bio available. Add a professional bio to help patients learn more about you.'}</p>
                    </div>

                    <button
                      onClick={() => setEditingProfile(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>✏️</span> Edit Profile
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }} className="space-y-6">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center py-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl mb-4"
                        />
                      ) : (
                        <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-4 border-white shadow-xl mb-4">
                          <span className="text-gray-400 text-5xl">👨‍⚕️</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className="cursor-pointer bg-white hover:bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow transition-all">
                          <span>📷 {photoFile ? 'Change Photo' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                        {photoFile && (
                          <button
                            type="button"
                            onClick={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium shadow-sm"
                          >
                            {uploadingPhoto ? '⏳ Uploading...' : '✓ Save Photo'}
                          </button>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-2">Max: 5MB (JPEG, PNG, GIF, WebP)</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty *</label>
                        <input
                          type="text"
                          value={profile.specialty}
                          onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                          placeholder="e.g., Cardiologist, Dermatologist"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years) *</label>
                        <input
                          type="number"
                          value={profile.experience}
                          onChange={(e) => setProfile({...profile, experience: e.target.value})}
                          placeholder="e.g., 5"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fee (USD) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={profile.fee}
                          onChange={(e) => setProfile({...profile, fee: e.target.value})}
                          placeholder="50.00"
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Bio</label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Tell patients about your background, expertise, and approach to healthcare..."
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>💾</span> Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <span>✕</span> Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Schedule & Availability</h2>
              <p className="text-blue-100 text-sm">Configure your working hours and availability</p>
            </div>
            
            <div className="p-6">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Availability Toggle */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🟢</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Availability Status</h3>
                      <p className="text-sm text-gray-500">Toggle to accept new appointment requests</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={availabilityState?.enabled ?? true} 
                      onChange={(e) => setAvailabilityState(s => ({ ...(s||{}), enabled: e.target.checked }))} 
                      className="sr-only peer" 
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">{availabilityState?.enabled !== false ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>

                {/* Working Days */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📅</span> Working Days
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, idx) => (
                      <label 
                        key={d} 
                        className={`px-4 py-2.5 rounded-xl cursor-pointer transition-all font-medium ${
                          availabilityState?.workingDays?.includes(idx) 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={availabilityState?.workingDays?.includes(idx)} 
                          onChange={() => {
                            const arr = new Set(availabilityState?.workingDays || []);
                            if (arr.has(idx)) arr.delete(idx); else arr.add(idx);
                            setAvailabilityState(s => ({ ...(s||{}), workingDays: Array.from(arr) }));
                          }} 
                        />
                        {d}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🕐</span> Available Time Slots
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(availabilityState?.timeSlots || availability).length > 0 ? (
                      (availabilityState?.timeSlots || availability).map((t) => (
                        <div key={t} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium shadow-sm">
                          {t}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No time slots configured</p>
                    )}
                  </div>
                </div>

                {/* Disabled Dates */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🚫</span> Blocked Dates
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">Add dates when you're unavailable for appointments</p>
                  <div className="flex items-center gap-3 mb-4">
                    <input 
                      type="date" 
                      id="addDisabled" 
                      className="border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('addDisabled');
                        if (!input || !input.value) return;
                        const date = input.value;
                        const arr = new Set(availabilityState?.disabledDates || []);
                        arr.add(date);
                        setAvailabilityState(s => ({ ...(s||{}), disabledDates: Array.from(arr) }));
                        input.value = '';
                      }} 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all"
                    >
                      + Add Date
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(availabilityState?.disabledDates || []).length > 0 ? (
                      (availabilityState?.disabledDates || []).map(d => (
                        <div key={d} className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                          <span className="text-red-700 font-medium text-sm">{new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <button 
                            onClick={() => setAvailabilityState(s => ({ ...(s||{}), disabledDates: (s.disabledDates||[]).filter(x => x !== d) }))} 
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No blocked dates</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => saveAvailability(availabilityState)} 
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>💾</span> Save Changes
                  </button>
                  <button 
                    onClick={() => fetchAvailability()} 
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <span>🔄</span> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {patientModalOpen && patientDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Patient Details</h3>
                <button 
                  onClick={() => setPatientModalOpen(false)} 
                  className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-all"
                >
                  ✕ Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">{patientDetails.patient?.name}</div>
                  <div className="text-gray-500">{patientDetails.patient?.email}</div>
                  <div className="mt-2 space-y-1">
                    {patientDetails.patient?.age && (
                      <div className="text-gray-700"><strong>Age:</strong> {patientDetails.patient.age}</div>
                    )}
                    {patientDetails.patient?.gender && (
                      <div className="text-gray-700"><strong>Gender:</strong> {patientDetails.patient.gender}</div>
                    )}
                    {patientDetails.patient?.phone && (
                      <div className="text-gray-700"><strong>Phone:</strong> {patientDetails.patient.phone}</div>
                    )}
                    {patientDetails.patient?.problem && (
                      <div className="text-gray-700"><strong>Problem/Symptoms:</strong> {patientDetails.patient.problem}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>📋</span> Appointment History (with you)
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {((patientDetails.appointments || []).filter(a => a.doctorId === user.id)).length > 0 ? (
                    (patientDetails.appointments || []).filter(a => a.doctorId === user.id).map(a => (
                      <div key={a.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{a.doctor?.user?.name || 'Doctor'}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(a.appointmentDate).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })} at {a.time}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            a.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                            a.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            a.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {a.status}
                          </span>
                        </div>
                        {a.reason && (
                          <div className="text-sm text-gray-600 bg-white p-2 rounded-lg mt-2">
                            <span className="font-medium">Reason:</span> {a.reason}
                          </div>
                        )}
                        {a.notes && (
                          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded-lg mt-2">
                            <span className="font-medium">Notes:</span> {a.notes}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No appointment history</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;