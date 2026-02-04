import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

// Default doctor image placeholder
const defaultDoctorImage = "https://via.placeholder.com/150?text=Doctor";

function Doctors() {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [feeFilter, setFeeFilter] = useState("");
  const [doctorsList, setDoctorsList] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get unique specialties from fetched doctors
  const specialties = [...new Set(doctorsList.map((d) => d.specialty))];

  // Fetch doctors from API and set initial specialty filter from query param
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/doctors");
        const doctors = response.data.map((doc) => ({
          id: doc.id,
          name: doc.name,
          specialty: doc.specialty,
          experience: doc.experience,
          fee: doc.fee,
          available: doc.available ?? true,
          photo: doc.photo || defaultDoctorImage,
          about: doc.about || "Experienced medical professional"
        }));
        setDoctorsList(doctors);
        setFilteredDoctors(doctors);
        setError(null);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Read 'speciality' query param
    const params = new URLSearchParams(location.search);
    const specialityParam = params.get('speciality') || "";
    setSpecialtyFilter(specialityParam);

    fetchDoctors();
  }, [location.search]);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-4xl font-extrabold text-blue-700 drop-shadow-lg">Find Your Doctor</h2>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? 'Hide Specialties' : 'Show Specialties'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          {showSidebar && (
            <aside className="w-full md:w-64 bg-white p-6 rounded-2xl shadow-xl animate-pop-in">
              <h3 className="font-bold mb-4 text-blue-700">Specialties</h3>
              <ul className="space-y-2">
                {specialties.map((spec) => (
                  <li key={spec}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-xl hover:bg-blue-100 transition font-semibold ${specialtyFilter === spec ? "bg-blue-200 text-blue-700" : "text-gray-700"}`}
                      onClick={() => setSpecialtyFilter(spec)}
                    >
                      {spec}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    className="mt-4 w-full bg-gray-200 px-3 py-2 rounded-xl hover:bg-gray-300 transition font-semibold text-gray-700"
                    onClick={() => setSpecialtyFilter("")}
                  >
                    Show All Doctors
                  </button>
                </li>
              </ul>
            </aside>
          )}

          <main className="flex-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 animate-fade-in">
              <h3 className="text-2xl font-bold mb-4 text-blue-700">Filter Doctors</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty</label>
                  <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)} className="w-full p-3 border border-blue-200 rounded-xl">
                    <option value="">All Specialties</option>
                    {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                  <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} className="w-full p-3 border border-blue-200 rounded-xl">
                    <option value="">All Doctors</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Fee (Rs.)</label>
                  <input type="number" value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)} placeholder="Enter max fee" className="w-full p-3 border border-blue-200 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-3 text-center py-10">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading doctors...</p>
                </div>
              ) : error ? (
                <div className="col-span-3 text-center py-10">
                  <p className="text-red-500">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-600">No doctors found matching your criteria.</p>
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-gradient-to-br from-white via-blue-50 to-blue-100 shadow-xl rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-pop-in">
                    <img src={doctor.photo} alt={doctor.name} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-blue-200 shadow-md" />
                    <h3 className="text-xl font-bold text-blue-700 mb-1">{doctor.name}</h3>
                    <p className="text-blue-500 font-semibold mb-1">{doctor.specialty}</p>
                    <p className="text-gray-600 mb-1">{doctor.experience} yrs exp</p>
                    <p className="text-gray-700 mb-2">Rs. {doctor.fee} per consultation</p>
                    <div className="flex gap-2 mt-3 w-full">
                      <Link to={`/doctors/${doctor.id}`} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200 text-center shadow-md">View Profile</Link>
                      <Link to={`/book/${doctor.id}`} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 hover:shadow-xl transition-all duration-200 text-center shadow-md">Book Now</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
      {/* Animations (Tailwind custom classes, add to your CSS if not present) */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        .animate-pop-in { animation: popIn 0.7s cubic-bezier(.17,.67,.83,.67); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );

}

export default Doctors;
