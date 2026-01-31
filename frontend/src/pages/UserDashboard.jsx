
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { doctorsData } from "../data/doctors";
import { toast } from 'react-toastify';
import { LoadingSpinner, CardSkeleton } from '../components/LoadingComponents';
import { DashboardCard, StatsCard, AppointmentCard } from '../components/CardComponents';
import { DashboardNav, DashboardHeader } from '../components/NavigationComponents';

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctorsList, setDoctorsList] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.doctor)) {
      navigate('/');
      return;
    }

    if (activeTab === 'doctors') {
      loadDoctors();
    } else if (activeTab === 'appointments') {
      loadAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  useEffect(() => {
    filterDoctors();
  }, [doctorsList, specialtyFilter, availabilityFilter, feeFilter]);

  const loadDoctors = () => {
    try {
      const mappedDoctors = doctorsData.map((doc) => ({
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty,
        experience: doc.experience,
        fee: doc.fee,
        available: true,
        image: doc.photo,
        about: doc.about || 'Experienced medical professional'
      }));
      setDoctorsList(mappedDoctors);
      setFilteredDoctors(mappedDoctors);
    } catch (err) {
      console.error("Load doctors error:", err);
      setError("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments/patient', { withCredentials: true });
      const sortedAppointments = response.data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      setAppointments(sortedAppointments);
    } catch (err) {
      console.error("Load appointments error:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctorsList;
    if (specialtyFilter) filtered = filtered.filter(d => d.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()));
    if (availabilityFilter) filtered = filtered.filter(d => availabilityFilter === 'available' ? d.available : !d.available);
    if (feeFilter) {
      const max = parseInt(feeFilter);
      if (!isNaN(max)) filtered = filtered.filter(d => d.fee <= max);
    }
    setFilteredDoctors(filtered);
  };

  const cancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {}, { withCredentials: true });
      setAppointments(appointments.map(a => a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a));
      toast.success('Appointment cancelled successfully!');
    } catch (err) {
      console.error("Cancel appointment error:", err);
      toast.error('Failed to cancel appointment');
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" className="text-blue-600" /></div>
  );

  if (user && (user.role === 'ADMIN' || user.doctor)) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">This dashboard is for patients only.</p>
      </div>
    </div>
  );

  const tabs = [
    { id: 'doctors', label: 'Find Doctors', icon: '👨‍⚕️' },
    { id: 'appointments', label: 'My Appointments', icon: '📅', badge: appointments.filter(a => a.status === 'PENDING').length || null }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title={`Welcome back, ${user.name}!`} subtitle="Manage your healthcare appointments" actions={<button onClick={() => { logout(); navigate('/login'); }} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">Logout</button>} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-8" />

        {activeTab === 'doctors' && (
          <div>
            <DashboardCard>
              <h2 className="text-xl font-semibold mb-4">🔍 Filter Doctors</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                  <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="">All Specialties</option>
                    <option value="General physician">General Physician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatricians">Pediatricians</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="">All Doctors</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Fee (Rs.)</label>
                  <input type="number" value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)} placeholder="Enter max fee" className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Available Doctors">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map((doctor) => (
                    <DashboardCard key={doctor.id} hover>
                      <div className="text-center">
                        <img src={doctor.image} alt={doctor.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
                        <p className="text-sm text-blue-600 font-medium mb-3">{doctor.specialty}</p>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center justify-center"><span className="mr-2">👨‍⚕️</span>{doctor.experience} years experience</div>
                          <div className="flex items-center justify-center"><span className="mr-2">💰</span>Rs. {doctor.fee} per consultation</div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/doctors/${doctor.id}`} className="flex-1 bg-gray-600 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-700">View Profile</Link>
                          <Link to={`/book/${doctor.id}`} className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700">Book Now</Link>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              )}

              {filteredDoctors.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👨‍⚕️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-600">Try adjusting your filters to find more doctors.</p>
                </div>
              )}
            </DashboardCard>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {appointments.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Pending" value={appointments.filter(a => a.status === 'PENDING').length} icon="⏳" color="yellow" />
                <StatsCard title="Accepted" value={appointments.filter(a => a.status === 'ACCEPTED').length} icon="✅" color="green" />
                <StatsCard title="Rejected" value={appointments.filter(a => a.status === 'REJECTED').length} icon="❌" color="red" />
                <StatsCard title="Cancelled" value={appointments.filter(a => a.status === 'CANCELLED').length} icon="🚫" color="gray" />
              </div>
            )}

            <DashboardCard title="My Appointments" actions={<button onClick={loadAppointments} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{loading ? 'Refreshing...' : '🔄 Refresh'}</button>}>
              {loading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                  <p className="text-gray-600 mb-6">You haven't booked any appointments yet.</p>
                  <Link to="/doctors" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Browse Doctors</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} className="" onCancel={cancelAppointment} />
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;