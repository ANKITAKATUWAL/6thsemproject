import { useParams, useNavigate } from "react-router-dom";
import { doctorsData } from "../data/doctors";
import { useAuth } from "../context/AuthContext";

function DoctorProfile() {
  const { id } = useParams();
  const doctor = doctorsData.find((d) => d.id === id);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!doctor) return <p className="text-center mt-10 text-red-500">Doctor not found</p>;

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
          src={doctor.photo}
          alt={doctor.name}
          className="w-48 h-48 rounded-full object-cover shadow-md"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{doctor.name}</h1>
          <p className="text-gray-600 mt-2"><strong>Specialty:</strong> {doctor.specialty}</p>
          <p className="text-gray-600"><strong>Experience:</strong> {doctor.experience} years</p>
          <p className="text-gray-600"><strong>Fee:</strong> ${doctor.fee}</p>

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
