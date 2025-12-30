import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { doctorsData } from "../data/doctors";

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
  }, [activeTab, user, navigate]);

  useEffect(() => {
    filterDoctors();
  }, [doctorsList, specialtyFilter, availabilityFilter, feeFilter]);

  const loadDoctors = () => {
    try {
      // Map the doctors data to include availability and other details
      const mappedDoctors = doctorsData.map((doc, index) => ({
        id: doc.id,
        name: doc.name,
        specialty: doc.specialty,
        experience: doc.experience,
        fee: doc.fee,
        available: true, // Assume all are available for now
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
      setAppointments(response.data);
    } catch (err) {
      console.error("Load appointments error:", err);
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctorsList;

    if (specialtyFilter) {
      filtered = filtered.filter(doctor => doctor.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()));
    }

    if (availabilityFilter) {
      if (availabilityFilter === 'available') {
        filtered = filtered.filter(doctor => doctor.available);
      } else if (availabilityFilter === 'unavailable') {
        filtered = filtered.filter(doctor => !doctor.available);
      }
    }

    if (feeFilter) {
      const maxFee = parseInt(feeFilter);
      if (!isNaN(maxFee)) {
        filtered = filtered.filter(doctor => doctor.fee <= maxFee);
      }
    }

    setFilteredDoctors(filtered);
  };

  const cancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/cancel`, {}, { withCredentials: true });
      // Update local state
      setAppointments(appointments.map(app =>
        app.id === appointmentId ? { ...app, status: 'CANCELLED' } : app
      ));
    } catch (err) {
      console.error("Cancel appointment error:", err);
      setError("Failed to cancel appointment");
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Please login to access dashboard.</p>;
  }

  if (user && (user.role === 'ADMIN' || user.doctor)) {
    return <p className="text-center mt-10 text-red-500">Access denied. Patient access only.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>
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
          { id: 'doctors', label: 'Find Doctors' },
          { id: 'appointments', label: 'My Appointments' }
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

      {/* Doctors Tab */}
      {activeTab === 'doctors' && (
        <div>
          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Filter Doctors</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
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
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">All Doctors</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Fee ($)</label>
                <input
                  type="number"
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value)}
                  placeholder="Enter max fee"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-center mb-2">{doctor.name}</h3>
                <p className="text-gray-600 text-center mb-1">{doctor.specialty}</p>
                <p className="text-gray-600 text-center mb-1">{doctor.experience} experience</p>
                <p className="text-green-600 font-semibold text-center mb-4">${doctor.fee} per consultation</p>
                <div className="flex gap-2">
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/book/${doctor.id}`}
                    className="flex-1 bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No doctors found matching your criteria.</p>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>

          {appointments.length === 0 ? (
            <p className="text-gray-500">You haven't booked any appointments yet.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{appointment.doctor.user.name}</h3>
                    <p className="text-gray-600">{appointment.doctor.specialty}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.time}
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

                  {appointment.status === 'PENDING' && (
                    <button
                      onClick={() => cancelAppointment(appointment.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;