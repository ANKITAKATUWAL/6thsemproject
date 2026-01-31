import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingComponents';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function MyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/appointments/patient', { withCredentials: true });
      const sorted = res.data.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
      setAppointments(sorted);
      setError('');
    } catch (err) {
      console.error('Failed to load appointments', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user && (user.role === 'ADMIN' || user.doctor)) {
      navigate('/');
      return;
    }

    loadAppointments();

    const id = setInterval(() => {
      loadAppointments();
    }, 15000);

    return () => clearInterval(id);
  }, [user, navigate, loadAppointments]);

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {}, { withCredentials: true });
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a));
      toast.success('Appointment cancelled successfully!');
    } catch (err) {
      console.error('Cancel error', err);
      toast.error('Failed to cancel appointment');
    }
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Filter appointments
  const filteredAppointments = activeFilter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status?.toUpperCase() === activeFilter);

  // Stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status?.toUpperCase() === 'PENDING').length,
    accepted: appointments.filter(a => a.status?.toUpperCase() === 'ACCEPTED').length,
    rejected: appointments.filter(a => a.status?.toUpperCase() === 'REJECTED').length,
    cancelled: appointments.filter(a => a.status?.toUpperCase() === 'CANCELLED').length,
  };

  // Get upcoming appointment
  const upcomingAppointment = appointments.find(a => 
    a.status?.toUpperCase() === 'ACCEPTED' && new Date(a.appointmentDate) > new Date()
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <LoadingSpinner size="lg" className="text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-3 border-white/30">
                  <span className="text-3xl">👤</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="text-emerald-100 text-sm">{getGreeting()}</p>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-emerald-100 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/doctors"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 border border-white/20"
              >
                <span>👨‍⚕️</span> Find Doctors
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
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
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 -mt-8">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveFilter('all')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveFilter('PENDING')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveFilter('ACCEPTED')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Accepted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.accepted}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveFilter('REJECTED')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Rejected</p>
                <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-xl">❌</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-gray-500 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveFilter('CANCELLED')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">{stats.cancelled}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🚫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointment Alert */}
        {upcomingAppointment && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800">Upcoming Appointment</h3>
                <p className="text-green-700 text-sm">
                  You have an appointment with <span className="font-semibold">Dr. {upcomingAppointment.doctor?.user?.name}</span> on{' '}
                  <span className="font-semibold">
                    {new Date(upcomingAppointment.appointmentDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span> at <span className="font-semibold">{upcomingAppointment.time}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">My Appointments</h2>
                    <p className="text-emerald-100 text-sm">
                      {activeFilter === 'all' ? 'All appointments' : `${activeFilter.charAt(0) + activeFilter.slice(1).toLowerCase()} appointments`}
                    </p>
                  </div>
                  <button
                    onClick={loadAppointments}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                  >
                    <span>🔄</span> Refresh
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-6 py-3 bg-gray-50 border-b flex gap-2 overflow-x-auto">
                {[
                  { id: 'all', label: 'All', count: stats.total },
                  { id: 'PENDING', label: 'Pending', count: stats.pending },
                  { id: 'ACCEPTED', label: 'Accepted', count: stats.accepted },
                  { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
                  { id: 'CANCELLED', label: 'Cancelled', count: stats.cancelled },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      activeFilter === filter.id
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="py-12 text-center">
                    <LoadingSpinner size="lg" className="text-emerald-600" />
                    <p className="mt-4 text-gray-500">Loading appointments...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📅</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {activeFilter === 'all' ? 'No appointments yet' : `No ${activeFilter.toLowerCase()} appointments`}
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                      {activeFilter === 'all' 
                        ? "You haven't booked any appointments yet. Find a doctor to book your first appointment."
                        : `You don't have any ${activeFilter.toLowerCase()} appointments.`
                      }
                    </p>
                    {activeFilter === 'all' && (
                      <Link 
                        to="/doctors" 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <span>👨‍⚕️</span> Find a Doctor
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAppointments.map(app => {
                      const rawStatus = (app.status || '').toString().toUpperCase();
                      const doctorName = app.doctor?.user?.name || 'Doctor';
                      const specialty = app.doctor?.specialty || 'Specialist';
                      const fee = app.doctor?.fee;
                      
                      return (
                        <div 
                          key={app.id} 
                          className={`bg-white border rounded-xl p-5 hover:shadow-lg transition-all duration-200 ${
                            rawStatus === 'PENDING' ? 'border-l-4 border-l-yellow-400 border-yellow-100' :
                            rawStatus === 'ACCEPTED' ? 'border-l-4 border-l-green-400 border-green-100' :
                            rawStatus === 'REJECTED' ? 'border-l-4 border-l-red-400 border-red-100' :
                            'border-l-4 border-l-gray-400 border-gray-100'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">👨‍⚕️</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">Dr. {doctorName}</h3>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    rawStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    rawStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                    rawStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {rawStatus === 'PENDING' ? '⏳ Pending' :
                                     rawStatus === 'ACCEPTED' ? '✅ Accepted' :
                                     rawStatus === 'REJECTED' ? '❌ Rejected' :
                                     '🚫 Cancelled'}
                                  </span>
                                </div>
                                <p className="text-sm text-emerald-600 font-medium mb-2">{specialty}</p>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    <span>📅</span> 
                                    {new Date(app.appointmentDate).toLocaleDateString('en-US', { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    <span>🕐</span> {app.time}
                                  </span>
                                  {fee && (
                                    <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                      <span>💰</span> Rs. {fee}
                                    </span>
                                  )}
                                  {/* Payment Status */}
                                  {app.payment && (
                                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                                      app.payment.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                      app.payment.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {app.payment.paymentStatus === 'COMPLETED' ? '✅ Paid' :
                                       app.payment.paymentStatus === 'PENDING' ? '⏳ Payment Pending' :
                                       '❌ Payment Failed'}
                                      {app.payment.paymentMethod && ` (${app.payment.paymentMethod})`}
                                    </span>
                                  )}
                                </div>
                                {app.reason && (
                                  <div className="mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                    <p className="text-sm text-emerald-800">
                                      <span className="font-medium">Reason:</span> {app.reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 md:items-end">
                              {rawStatus === 'PENDING' && (
                                <button
                                  onClick={() => cancelAppointment(app.id)}
                                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow flex items-center gap-1"
                                >
                                  <span>✕</span> Cancel
                                </button>
                              )}
                              {rawStatus === 'ACCEPTED' && (
                                <div className="text-right">
                                  <p className="text-sm text-green-600 font-medium">✓ Confirmed</p>
                                  <p className="text-xs text-gray-500">See you on your appointment day!</p>
                                </div>
                              )}
                              {rawStatus === 'REJECTED' && (
                                <div className="text-right">
                                  <p className="text-sm text-red-600 font-medium">Appointment declined</p>
                                  <Link to="/doctors" className="text-xs text-blue-600 hover:underline">Book with another doctor →</Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/doctors"
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">👨‍⚕️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Find a Doctor</p>
                    <p className="text-xs text-gray-500">Browse available doctors</p>
                  </div>
                </Link>
                <button
                  onClick={loadAppointments}
                  className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-xl">🔄</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Refresh Status</p>
                    <p className="text-xs text-gray-500">Check appointment updates</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>💡</span> Health Tip
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Remember to prepare a list of symptoms and questions before your appointment. This helps your doctor understand your concerns better and provide more accurate care.
              </p>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>👤</span> My Account
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-medium text-gray-900">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyDashboard;
