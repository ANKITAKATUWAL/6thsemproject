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

  const handleBookAppointment = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${doctor.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <button
        onClick={() => navigate("/doctors")}
        className="text-blue-600 hover:underline mb-4"
      >
        &larr; Back to Doctors
      </button>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={doctor.photo || defaultDoctorImage}
          alt={doctor.name}
          className="w-48 h-48 rounded-full object-cover shadow-md"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{doctor.name}</h1>
          <p className="text-gray-600 mt-2"><strong>Specialty:</strong> {doctor.specialty}</p>
          <p className="text-gray-600"><strong>Experience:</strong> {doctor.experience} years</p>
          <p className="text-gray-600"><strong>Fee:</strong> Rs. {doctor.fee}</p>
          {doctor.about && (
            <p className="text-gray-600 mt-4"><strong>About:</strong> {doctor.about}</p>
          )}

          <button
            onClick={handleBookAppointment}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
