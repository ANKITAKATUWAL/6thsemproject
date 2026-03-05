import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const defaultDoctorImage = "https://via.placeholder.com/150?text=Doctor";

function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviews] = useState([
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
    }
  ]);

  const certifications = [
    "MBBS, AIIMS Delhi",
    "MD, Cardiology, PGI Chandigarh"
  ];

  const education = [
    "AIIMS Delhi (2010-2015)",
    "PGI Chandigarh (2015-2018)"
  ];

  const specialties = [
    "Cardiology",
    "Internal Medicine",
    "Preventive Care"
  ];

  const faqs = [
    { q: "How do I book an appointment?", a: "From dashboard." },
    { q: "Can I reschedule?", a: "Yes, from profile." }
  ];

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        setError("Doctor not found");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "-";

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back to Home Button */}
      <div className="max-w-4xl mx-auto px-4 pt-2">
        <button
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition-all duration-200"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">

        {/* SIDEBAR */}
        <aside className="md:w-1/3 bg-white p-6 rounded-xl shadow">
          <img
            src={doctor.photo || defaultDoctorImage}
            alt={doctor.name}
            className="w-32 h-32 rounded-full mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-center">{doctor.name}</h1>
          <p className="text-center text-gray-600">{doctor.specialty}</p>

          <div className="mt-4 text-sm space-y-2">
            <p><b>Experience:</b> {doctor.experience} years</p>
            <p><b>Fee:</b> Rs. {doctor.fee}</p>
          </div>

          <div className="mt-4">
            <h3 className="font-bold mb-2">Specialties</h3>
            <ul className="list-disc list-inside">
              {specialties.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 space-y-6">

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-2">About</h2>
            <p>{doctor.about || "No description available."}</p>
          </section>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-2">Education</h2>
            <ul className="list-disc list-inside">
              {education.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-2">Reviews ({avgRating})</h2>
            {reviews.map((r, i) => (
              <p key={i} className="text-sm text-gray-700">• {r.comment}</p>
            ))}
          </section>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-2">FAQs</h2>
            {faqs.map((f, i) => (
              <p key={i}><b>Q:</b> {f.q}</p>
            ))}
          </section>

        </main>
      </div>
    </div>
  );
}

export default DoctorProfile;
