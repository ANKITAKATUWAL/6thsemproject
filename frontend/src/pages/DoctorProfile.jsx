import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

// Default doctor image placeholder
const defaultDoctorImage = "https://via.placeholder.com/150?text=Doctor";


function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  // Mock ratings and reviews
  const [reviews, setReviews] = useState([
    {
      name: "Amit Sharma",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5,
      comment: "Very professional and caring. Highly recommended!",
      date: "Jan 2026"
    },
    {
      name: "Priya Singh",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4,
      comment: "Explained everything clearly. Great experience.",
      date: "Dec 2025"
    },
    {
      name: "Rahul Verma",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      rating: 5,
      comment: "Helped me recover quickly. Thank you!",
      date: "Nov 2025"
    }
  ]);
  // Mock certifications, education, specialties, FAQ
  const certifications = ["MBBS, AIIMS Delhi", "MD, Cardiology, PGI Chandigarh", "Fellowship, American College of Cardiology"];
  const education = ["AIIMS Delhi (2010-2015)", "PGI Chandigarh (2015-2018)"];
  const specialties = ["Cardiology", "Internal Medicine", "Preventive Care"];
  const faqs = [
    {
      q: "How do I book an appointment?",
      a: "Select your preferred date and time slot, then click 'Book Now'."
    },
    {
      q: "What should I bring for my appointment?",
      a: "Please bring your previous medical records and a valid ID."
    },
    {
      q: "Can I reschedule my appointment?",
      a: "Yes, you can reschedule from your dashboard or contact support."
    }
  ];

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/doctors/${id}`);
        setDoctor(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching doctor:", err);
        setError("Doctor not found");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Fetch booked slots for selected date
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !doctor?.id) {
        setBookedSlots([]);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/appointments/booked-slots?doctorId=${doctor.id}&date=${selectedDate}`);
        setBookedSlots(response.data.bookedSlots || []);
      } catch {
        setBookedSlots([]);
      }
    };
    fetchBookedSlots();
  }, [selectedDate, doctor]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-2 text-gray-600">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return <p className="text-center mt-10 text-red-500">{error || "Doctor not found"}</p>;
  }

  // Ratings mock
  const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "-";

  // Booking handler
  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time slot.");
      return;
    }
    if (!user) {
      // Save booking info to localStorage and redirect to login
      localStorage.setItem('pendingBooking', JSON.stringify({ doctorId: doctor.id, date: selectedDate, time: selectedTime }));
      navigate('/login');
      return;
    }
    navigate(`/book/${doctor.id}?date=${selectedDate}&time=${selectedTime}`);
  };

  // Generate next 7 days for booking
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };

  // Group time slots by morning/afternoon/evening
  const groupTimeSlots = (slots) => {
    const morning = [];
    const afternoon = [];
    const evening = [];
    slots.forEach(slot => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });
    return { morning, afternoon, evening };
  };

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-2xl rounded-2xl animate-fade-in">
      {/* Back Button */}
      <div className="flex justify-end pt-8 pr-8">
        <button
          onClick={() => navigate("/doctors")}
          className="bg-white text-blue-700 font-bold px-6 py-2 rounded-xl shadow hover:bg-blue-100 transition"
        >
          &larr; Back to Doctors
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-10 p-8">
        {/* Sidebar Quick Info */}
        <aside className="md:w-72 w-full bg-white border border-blue-100 rounded-2xl shadow-xl p-6 flex flex-col gap-6 animate-pop-in">
          <img
            src={doctor.photo || defaultDoctorImage}
            alt={doctor.name}
            className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-blue-200 mx-auto mb-2"
          />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-blue-700 mb-1">{doctor.name}</h1>
            <span className="block text-gray-700 font-semibold mb-1">{doctor.specialty}</span>
            <span className={`px-4 py-1 rounded-full text-sm font-bold shadow-md border ${doctor.available ? 'bg-green-100 text-green-700 border-green-300 animate-pulse' : 'bg-red-100 text-red-700 border-red-300'}`}>{doctor.available ? 'Available' : 'Unavailable'}</span>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <span><strong>Experience:</strong> {doctor.experience} years</span>
            <span><strong>Fee:</strong> Rs. {doctor.fee}</span>
            <span><strong>Email:</strong> doctor@citycare.com</span>
            <span><strong>Contact:</strong> +91-9876543210</span>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <span className="font-bold text-blue-700">Specialties</span>
            <ul className="list-disc list-inside text-gray-700">
              {specialties.map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8">
          {/* Booking Panel */}
          {/* Sticky/Movable Booking Panel */}
          <div>
            {/* Desktop Sticky Panel */}
            <div className="hidden md:block w-full md:w-96 md:sticky md:top-10 h-fit bg-white border border-blue-200 rounded-2xl shadow-xl p-6 flex flex-col gap-4 animate-pop-in self-end md:self-start">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">Book Appointment</h2>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Date</label>
                <select value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }} className="w-full p-2 border border-blue-200 rounded-xl">
                  <option value="">Choose date</option>
                  {getNext7Days().map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
              {selectedDate && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Time Slot</label>
                  {doctor.timeSlots ? (
                    (() => {
                      const grouped = groupTimeSlots(doctor.timeSlots);
                      return (
                        <div className="space-y-2">
                          {Object.entries(grouped).map(([period, slots]) => (
                            slots.length > 0 && (
                              <div key={period}>
                                <span className="font-semibold text-blue-600 capitalize">{period}</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {slots.map(slot => {
                                    const isBooked = bookedSlots.includes(slot);
                                    return (
                                      <button
                                        key={slot}
                                        type="button"
                                        disabled={isBooked}
                                        className={`px-3 py-1 rounded-full border font-semibold text-sm shadow transition ${selectedTime === slot ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'} ${isBooked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-200'}`}
                                        onClick={() => setSelectedTime(slot)}
                                      >
                                        {slot} {isBooked ? '(Booked)' : ''}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-gray-500">No time slots available.</span>
                  )}
                </div>
              )}
              <button
                onClick={handleBookAppointment}
                className={`mt-2 px-6 py-3 rounded-xl font-bold shadow-xl transition-all duration-200 text-lg ${doctor.available && selectedTime ? 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:scale-105 hover:shadow-2xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={!doctor.available || !selectedTime}
              >
                {doctor.available ? 'Book Now' : 'Not Available'}
              </button>
            </div>

            {/* Mobile Bottom Fixed Panel */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-blue-200 shadow-2xl z-50 animate-pop-in">
              <div className="p-4 flex flex-col gap-2">
                <h2 className="text-lg font-bold text-blue-700 mb-1">Book Appointment</h2>
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                  <select value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(""); }} className="w-full p-2 border border-blue-200 rounded-xl text-xs">
                    <option value="">Date</option>
                    {getNext7Days().map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
                {selectedDate && (
                  <div className="mb-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                    {doctor.timeSlots ? (
                      (() => {
                        const grouped = groupTimeSlots(doctor.timeSlots);
                        return (
                          <div className="space-y-1">
                            {Object.entries(grouped).map(([period, slots]) => (
                              slots.length > 0 && (
                                <div key={period}>
                                  <span className="font-semibold text-blue-600 capitalize text-xs">{period}</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {slots.map(slot => {
                                      const isBooked = bookedSlots.includes(slot);
                                      return (
                                        <button
                                          key={slot}
                                          type="button"
                                          disabled={isBooked}
                                          className={`px-2 py-1 rounded-full border font-semibold text-xs shadow transition ${selectedTime === slot ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'} ${isBooked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-200'}`}
                                          onClick={() => setSelectedTime(slot)}
                                        >
                                          {slot} {isBooked ? '(Booked)' : ''}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-gray-500">No time slots available.</span>
                    )}
                  </div>
                )}
                <button
                  onClick={handleBookAppointment}
                  className={`mt-2 px-4 py-2 rounded-xl font-bold shadow-xl transition-all duration-200 text-base ${doctor.available && selectedTime ? 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:scale-105 hover:shadow-2xl' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  disabled={!doctor.available || !selectedTime}
                >
                  {doctor.available ? 'Book Now' : 'Not Available'}
                </button>
              </div>
            </div>
          </div>

          {/* Doctor Details Section */}
          <section className="bg-white border border-blue-100 rounded-2xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">About Dr. {doctor.name}</h2>
            {doctor.about && <p className="text-gray-700 mb-4">{doctor.about}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-blue-700 mb-2">Certifications</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {certifications.map((c, idx) => <li key={idx}>{c}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-blue-700 mb-2">Education</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {education.map((e, idx) => <li key={idx}>{e}</li>)}
                </ul>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-white border border-blue-100 rounded-2xl shadow-xl p-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-blue-700 mb-6">Patient Reviews</h3>
            <div className="flex items-center gap-6 mb-6">
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-6 h-6 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" /></svg>
                ))}
              </span>
              <span className="text-blue-700 font-bold text-xl">{avgRating}</span>
              <span className="text-gray-500 text-lg">({reviews.length} reviews)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl shadow p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-1">
                    <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover border-2 border-blue-300" />
                    <span className="font-bold text-blue-700">{review.name}</span>
                    <span className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" /></svg>
                      ))}
                    </span>
                    <span className="text-gray-500 text-xs">{review.date}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white border border-blue-100 rounded-2xl shadow-xl p-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-blue-700 mb-6">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="font-semibold text-blue-700 mb-1">Q: {faq.q}</p>
                  <p className="text-gray-700">A: {faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Animations (Tailwind custom classes, add to your CSS if not present) */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        .animate-pop-in { animation: popIn 0.7s cubic-bezier(.17,.67,.83,.67); }
        .animate-pulse { animation: pulse 1.5s infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      `}</style>
    </div>
  );
}

export default DoctorProfile;
