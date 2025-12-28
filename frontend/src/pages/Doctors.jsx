import { useState } from "react";
import { Link } from "react-router-dom";
import { doctorsData } from "../data/doctors";

function Doctors() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  // Get unique specialties
  const specialties = [...new Set(doctorsData.map((d) => d.specialty))];

  // Filter doctors by selected specialty
  const filteredDoctors = selectedSpecialty
    ? doctorsData.filter((d) => d.specialty === selectedSpecialty)
    : doctorsData;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      {showSidebar && (
        <aside className="w-64 bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-4">Specialties</h3>
          <ul className="space-y-2">
            {specialties.map((spec) => (
              <li key={spec}>
                <button
                  className={`w-full text-left px-3 py-1 rounded hover:bg-blue-100 transition ${
                    selectedSpecialty === spec ? "bg-blue-200 font-bold" : ""
                  }`}
                  onClick={() => setSelectedSpecialty(spec)}
                >
                  {spec}
                </button>
              </li>
            ))}
            <li>
              <button
                className="mt-4 w-full bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                onClick={() => {
                  setSelectedSpecialty(null);
                }}
              >
                Show All Doctors
              </button>
            </li>
          </ul>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Doctors</h2>
          {!showSidebar && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={() => setShowSidebar(true)}
            >
              Show Specialties
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  


          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center text-center hover:shadow-2xl transition"
            >
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <h3 className="text-lg font-bold">{doctor.name}</h3>
              <p className="text-gray-600">{doctor.specialty}</p>
              <p className="text-gray-600">{doctor.experience} yrs exp</p>
              <p className="text-gray-600">${doctor.fee} per consultation</p>
              <Link
                to={`/doctors/${doctor.id}`}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Doctors;
