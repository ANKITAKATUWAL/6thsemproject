import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  const updateStatus = async (appointmentId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${appointmentId}/status`, { status }, { withCredentials: true });
      // Update local state
      setAppointments(appointments.map(app =>
        app.id === appointmentId ? { ...app, status } : app
      ));
    } catch (err) {
      console.error("Update status error:", err);
      setError("Failed to update appointment status");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>

        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments yet.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{appointment.patient.name}</h3>
                  <p className="text-gray-600">{appointment.patient.email}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.time}
                  </p>
                  {appointment.reason && <p className="text-sm">Reason: {appointment.reason}</p>}
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    appointment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>

                {appointment.status === 'PENDING' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => updateStatus(appointment.id, 'ACCEPTED')}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(appointment.id, 'REJECTED')}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;