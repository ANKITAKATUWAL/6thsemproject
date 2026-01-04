import { useParams, Link, useNavigate } from "react-router-dom";
import { doctorsData } from "../data/doctors";
import { useState } from "react";
import axios from "axios";
import api from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

function BookAppointment() {
  const { id } = useParams();
  const doctor = doctorsData.find((d) => d.id === id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    date: "",
    time: "",
    reason: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!doctor) return <p className="text-center mt-10 text-red-500">Doctor not found</p>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to book an appointment");
      navigate('/login');
      return;
    }

    setLoading(true);
    setError("");

    try {
      const doctorId = parseInt(id.replace('doc', ''));
      const response = await api.post('/appointments/book', {
        doctorId,
        appointmentDate: `${form.date}T${form.time}:00`, // Combine date and time
        time: form.time,
        reason: form.reason
      });

      setSubmitted(true);
      toast.success('Appointment booked successfully!');
      
      // Redirect to user dashboard after a short delay
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 2000);
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <Link to={`/doctors`} className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Doctors
      </Link>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Book Appointment with {doctor.name}
      </h2>

      {submitted ? (
        <div className="text-center py-8">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-2xl font-bold">Appointment Booked Successfully!</h3>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-green-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Your appointment is currently <strong>PENDING</strong></li>
              <li>• The doctor will review and accept/reject your appointment</li>
              <li>• You'll receive status updates in your dashboard</li>
              <li>• You can cancel pending appointments anytime</li>
            </ul>
          </div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-center">{error}</p>}
          {["name", "age", "phone", "date", "time"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-semibold capitalize">{field}:</label>
              <input
                type={field === "age" ? "number" : field === "phone" ? "tel" : field === "date" ? "date" : field === "time" ? "time" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-gray-700 font-semibold">Reason for visit:</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      )}
    </div>
  );
}

export default BookAppointment;
