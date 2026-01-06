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
    bio: ''
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
        bio: d.bio || ''
      });
      setProfileExists(true);
    } catch (err) {
      if (err?.response?.status === 404) {
        // Profile missing
        setProfileExists(false);
        setProfile({ specialty: '', experience: '', fee: '', bio: '' });
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Doctor privileges required.</p>
        </div>
        {patientModalOpen && patientDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Patient Details</h3>
                <button onClick={() => setPatientModalOpen(false)} className="text-gray-500">Close</button>
              </div>
              <div>
                <div className="mb-3">
                  <div className="text-lg font-semibold">{patientDetails.patient?.name}</div>
                  <div className="text-sm text-gray-600">{patientDetails.patient?.email}</div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Appointment History</h4>
                  <div className="space-y-2">
                    {(patientDetails.appointments || []).map(a => (
                      <div key={a.id} className="border rounded p-3 bg-gray-50">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{a.doctor?.user?.name || 'Doctor'}</div>
                            <div className="text-sm text-gray-600">{new Date(a.appointmentDate).toLocaleString()}</div>
                          </div>
                          <div className="text-sm">Status: {a.status}</div>
                        </div>
                        {a.reason && <div className="text-sm text-gray-700 mt-2">Reason: {a.reason}</div>}
                        {a.notes && <div className="text-sm text-gray-700 mt-1">Notes: {a.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const tabs = [
    { id: 'appointments', label: 'Appointments', icon: '📅', badge: appointments.filter(a => a.status === 'PENDING').length || null },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'availability', label: 'Availability', icon: '🕐' }
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

  const specialty = user.doctor?.specialty || profile.specialty || 'Not specified';
  const experience = user.doctor?.experience || profile.experience || '—';
  const fee = user.doctor?.fee || profile.fee || '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        title={`Dr. ${user.name}`}
        subtitle={`${specialty} • ${experience} yrs • ${fee !== '—' ? `$${fee}` : 'Fee not set'}`}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                <div>
                  <div className="text-sm text-gray-500">Doctor</div>
                  <div className="text-lg font-semibold">Dr. {user.name}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <StatsCard title="Total Appointments" value={totalAppointments} icon="🔢" color="blue" />
          </div>
          <div>
            <StatsCard title="Today's Appointments" value={todayAppointments} icon="📅" color="purple" />
          </div>
          <div>
            <StatsCard title="Pending Requests" value={pendingRequests} icon="⏳" color="yellow" />
          </div>
        </div>
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
                      onViewPatient={openPatientDetails}
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
                  {!profileExists && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 font-medium">Complete Profile</p>
                      <p className="text-sm text-gray-600">You haven't completed your doctor profile yet. Please go to the profile section to add your details.</p>
                    </div>
                  )}
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
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.specialty || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.experience || 'Not specified'} years</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{profile.fee ? `$${profile.fee}` : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[60px]">{profile.bio || 'No bio available'}</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={profile.fee}
                      onChange={(e) => setProfile({...profile, fee: e.target.value})}
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
              <div className="mb-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={availabilityState?.enabled ?? true} onChange={(e) => setAvailabilityState(s => ({ ...(s||{}), enabled: e.target.checked }))} />
                  <span className="text-sm">Availability ON</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working days</label>
                <div className="flex gap-2 flex-wrap">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, idx) => (
                    <label key={d} className={`px-3 py-1 rounded border ${availabilityState?.workingDays?.includes(idx) ? 'bg-blue-600 text-white' : 'bg-white'}`}>
                      <input type="checkbox" className="hidden" checked={availabilityState?.workingDays?.includes(idx)} onChange={() => {
                        const arr = new Set(availabilityState?.workingDays || []);
                        if (arr.has(idx)) arr.delete(idx); else arr.add(idx);
                        setAvailabilityState(s => ({ ...(s||{}), workingDays: Array.from(arr) }));
                      }} />
                      {d}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time slots</label>
                <div className="flex gap-2 flex-wrap">
                  {(availabilityState?.timeSlots || availability).map((t) => (
                    <div key={t} className="px-3 py-1 bg-gray-100 rounded">{t}</div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Disabled dates</label>
                <div className="flex items-center gap-2">
                  <input type="date" id="addDisabled" className="border p-2 rounded" />
                  <button onClick={() => {
                    const input = document.getElementById('addDisabled');
                    if (!input || !input.value) return;
                    const date = input.value;
                    const arr = new Set(availabilityState?.disabledDates || []);
                    arr.add(date);
                    setAvailabilityState(s => ({ ...(s||{}), disabledDates: Array.from(arr) }));
                    input.value = '';
                  }} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
                </div>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {(availabilityState?.disabledDates || []).map(d => (
                    <div key={d} className="px-3 py-1 bg-red-100 rounded flex items-center gap-2">
                      <span className="text-sm">{d}</span>
                      <button onClick={() => setAvailabilityState(s => ({ ...(s||{}), disabledDates: (s.disabledDates||[]).filter(x => x !== d) }))} className="text-red-600">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => saveAvailability(availabilityState)} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
                <button onClick={() => fetchAvailability()} className="bg-gray-600 text-white px-4 py-2 rounded">Reload</button>
              </div>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;