import { Link } from "react-router-dom";

function DoctorCard({ doctor }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <img
        src={doctor.image}
        alt={doctor.name}
        className="w-full h-48 object-cover rounded"
      />

      <h2 className="text-xl font-semibold mt-3">{doctor.name}</h2>
      <p className="text-gray-600">{doctor.specialization}</p>

      <Link
        to={`/doctors/${doctor.id}`}
        className="block text-center mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        View Profile
      </Link>
    </div>
  );
}

export default DoctorCard;
