import { useParams, Link, useNavigate } from "react-router-dom";
import { doctorsData } from "../data/doctors";
import { useState } from "react";
import axios from "axios";
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
      const response = await axios.post('http://localhost:5000/api/appointments/book', {
        doctorId,
        appointmentDate: `${form.date}T${form.time}:00`, // Combine date and time
        time: form.time,
        reason: form.reason
      }, { withCredentials: true });

      setSubmitted(true);
      toast.success('Appointment booked successfully!');
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
        <p className="text-green-600 font-bold text-center">
          Appointment booked successfully!
        </p>
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
