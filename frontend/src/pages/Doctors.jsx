import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doctorsData } from "../data/doctors";

function Doctors() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [feeFilter, setFeeFilter] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Get unique specialties
  const specialties = [...new Set(doctorsData.map((d) => d.specialty))];

  useEffect(() => {
    const mapped = doctorsData.map((doc) => ({
      id: doc.id,
      name: doc.name,
      specialty: doc.specialty,
      experience: doc.experience,
      fee: doc.fee,
      available: doc.available ?? true,
      photo: doc.photo,
      about: doc.about || "Experienced medical professional"
    }));
    setDoctorsList(mapped);
    setFilteredDoctors(mapped);
  }, []);

  useEffect(() => {
    let filtered = doctorsList;
    if (specialtyFilter) filtered = filtered.filter(d => d.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()));
    if (availabilityFilter) filtered = filtered.filter(d => availabilityFilter === 'available' ? d.available : !d.available);
    if (feeFilter) {
      const max = parseInt(feeFilter);
      if (!isNaN(max)) filtered = filtered.filter(d => d.fee <= max);
    }
    setFilteredDoctors(filtered);
  }, [doctorsList, specialtyFilter, availabilityFilter, feeFilter]);

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Doctors</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? 'Hide Specialties' : 'Show Specialties'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-full md:w-64 bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-4">Specialties</h3>
            <ul className="space-y-2">
              {specialties.map((spec) => (
                <li key={spec}>
                  <button
                    className={`w-full text-left px-3 py-1 rounded hover:bg-blue-100 transition ${
                      specialtyFilter === spec ? "bg-blue-200 font-bold" : ""
                    }`}
                    onClick={() => setSpecialtyFilter(spec)}
                  >
                    {spec}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="mt-4 w-full bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                  onClick={() => setSpecialtyFilter("")}
                >
                  Show All Doctors
                </button>
              </li>
            </ul>
          </aside>
        )}

        <main className="flex-1">
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-semibold mb-3">Filter Doctors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="">All Specialties</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg">
                  <option value="">All Doctors</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Fee ($)</label>
                <input type="number" value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)} placeholder="Enter max fee" className="w-full p-3 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center text-center hover:shadow-2xl transition">
                <img src={doctor.photo} alt={doctor.name} className="w-32 h-32 rounded-full object-cover mb-4" />
                <h3 className="text-lg font-bold">{doctor.name}</h3>
                <p className="text-gray-600">{doctor.specialty}</p>
                <p className="text-gray-600">{doctor.experience} yrs exp</p>
                <p className="text-gray-600">${doctor.fee} per consultation</p>
                <div className="flex gap-2 mt-3 w-full">
                  <Link to={`/doctors/${doctor.id}`} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition text-center">View Profile</Link>
                  <Link to={`/book/${doctor.id}`} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-center">Book Now</Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Doctors;
