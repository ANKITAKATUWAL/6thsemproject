import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingComponents';
import { DashboardCard } from '../components/CardComponents';
import { useNavigate } from 'react-router-dom';

function MyDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/appointments/patient', { withCredentials: true });
      const sorted = res.data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
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
      // not patient
      navigate('/');
      return;
    }

    loadAppointments();

    const id = setInterval(() => {
      loadAppointments();
    }, 8000);

    return () => clearInterval(id);
  }, [user, navigate, loadAppointments]);

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {}, { withCredentials: true });
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a));
    } catch (err) {
      console.error('Cancel error', err);
      setError('Failed to cancel appointment');
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" className="text-blue-600" /></div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Dashboard</h2>
          <div className="space-x-3">
            <button onClick={() => { logout(); navigate('/login'); }} className="bg-red-600 text-white px-4 py-2 rounded-lg">Logout</button>
            <button onClick={loadAppointments} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Refresh</button>
          </div>
        </div>

        <DashboardCard>
          <h3 className="text-lg font-semibold mb-4">My Bookings</h3>

          {loading ? (
            <div className="py-8 text-center"><LoadingSpinner /></div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">You have no bookings. Browse doctors to book an appointment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(app => {
                const rawStatus = (app.status || '').toString().toUpperCase();
                const status = rawStatus === 'PENDING' ? 'Pending' : rawStatus === 'ACCEPTED' ? 'Accepted' : 'Cancelled';
                const statusClasses = rawStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : rawStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
                const doctorName = app.doctor?.user?.name || app.doctorName || 'Doctor';
                const dateTime = app.appointmentDate ? new Date(app.appointmentDate).toLocaleString() : (app.time ? app.time : 'TBD');

                return (
                  <div key={app.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{doctorName}</div>
                      <div className="text-sm text-gray-600">{dateTime}</div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${statusClasses}`}>
                        {status}
                      </div>

                      {rawStatus === 'PENDING' && (
                        <button onClick={() => cancelAppointment(app.id)} className="block mt-2 w-full bg-red-600 text-white px-3 py-1 rounded-lg">Cancel</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}

export default MyDashboard;
