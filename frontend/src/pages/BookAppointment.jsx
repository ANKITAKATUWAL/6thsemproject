import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import api from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';

// Payment method icons
const KhaltiIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <text x="7" y="16" fontSize="10" fontWeight="bold">K</text>
  </svg>
);

function BookAppointment() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [form, setForm] = useState({
    name: user?.name || "",
    age: "",
    gender: "",
    phone: "",
    date: "",
    time: "",
    reason: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("KHALTI");
  const [appointmentCreated, setAppointmentCreated] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Fetch doctor details from API
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setDoctorLoading(true);
        const response = await axios.get(`http://localhost:5000/api/doctors/${id}`);
        setDoctor(response.data);
      } catch (err) {
        console.error("Error fetching doctor:", err);
        setError("Doctor not found");
      } finally {
        setDoctorLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Update form name when user loads
  useEffect(() => {
    if (user?.name) {
      setForm(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

  if (doctorLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-2 text-gray-600">Loading...</p>
      </div>
    );
  }

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
      // First create the appointment
      const response = await api.post('/appointments/book', {
        doctorId: doctor.id,
        appointmentDate: `${form.date}T${form.time}:00`,
        time: form.time,
        reason: form.reason,
        name: form.name,
        age: form.age,
        gender: form.gender,
        phone: form.phone
      });

      const appointment = response.data;
      setAppointmentCreated(appointment);

      // Then initiate payment
      setProcessingPayment(true);
      const paymentResponse = await api.post('/payments/initiate', {
        appointmentId: appointment.id,
        amount: doctor.fee,
        paymentMethod: paymentMethod
      });

      if (paymentMethod === 'KHALTI' && paymentResponse.data.payment_url) {
        // Redirect to Khalti payment page
        toast.info('Redirecting to Khalti payment...');
        window.location.href = paymentResponse.data.payment_url;
        return;
      } else if (paymentMethod === 'CASH') {
        setSubmitted(true);
        toast.success('Appointment booked! Please pay at the clinic.');
        setTimeout(() => {
          navigate('/my-dashboard');
        }, 2000);
      } else {
        setSubmitted(true);
        toast.success('Appointment booked successfully!');
        setTimeout(() => {
          navigate('/my-dashboard');
        }, 2000);
      }

    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
      setProcessingPayment(false);
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
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold">Full Name:</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Age */}
          <div>
            <label className="block text-gray-700 font-semibold">Age:</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Gender */}
          <div>
            <label className="block text-gray-700 font-semibold">Gender:</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-semibold">Phone:</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Date */}
          <div>
            <label className="block text-gray-700 font-semibold">Date:</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Time */}
          <div>
            <label className="block text-gray-700 font-semibold">Time:</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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

          {/* Payment Method Selection */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Method</h3>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                <strong>Consultation Fee:</strong> <span className="text-green-600 font-bold">Rs. {doctor.fee}</span>
              </p>
            </div>
            
            <div className="space-y-3">
              {/* Khalti Payment */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'KHALTI' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="KHALTI"
                  checked={paymentMethod === 'KHALTI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4 text-purple-600"
                />
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">K</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Khalti</p>
                    <p className="text-sm text-gray-500">Pay securely with Khalti wallet</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>
              </label>

              {/* eSewa Payment */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition opacity-50 ${paymentMethod === 'ESEWA' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ESEWA"
                  disabled
                  className="mr-3 w-4 h-4 text-green-600"
                />
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-lg">e</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">eSewa</p>
                    <p className="text-sm text-gray-500">Pay with eSewa wallet</p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Coming Soon</span>
              </label>

              {/* Cash Payment */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'CASH' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 w-4 h-4 text-yellow-600"
                />
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-xl">💵</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Cash</p>
                    <p className="text-sm text-gray-500">Pay at the clinic</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || processingPayment}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50"
          >
            {processingPayment ? "Processing Payment..." : loading ? "Booking..." : paymentMethod === 'KHALTI' ? `Pay Rs. ${doctor.fee} with Khalti` : paymentMethod === 'CASH' ? "Book & Pay at Clinic" : "Confirm Appointment"}
          </button>
        </form>
      )}
    </div>
  );
}

export default BookAppointment;
