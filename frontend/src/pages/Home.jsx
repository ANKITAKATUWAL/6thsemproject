import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaClock, FaUserMd, FaLaptop, FaSearch, FaCalendarAlt, FaVideo, FaStethoscope, FaAward, FaUsers, FaHospital, FaStar, FaCheckCircle, FaArrowRight, FaShieldAlt, FaHeadset } from "react-icons/fa";
import { assets, specialityData } from "../assets/assets/assets_frontend/assets.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/doctors");
        const data = await response.json();
        setDoctors(data);
        setError(null);
      } catch (err) {
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const topDoctors = doctors.slice(0, 8);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm || selectedSpeciality) {
      navigate(`/doctors?search=${searchTerm}&speciality=${selectedSpeciality}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <div className="font-sans bg-white min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Page content wrapper with no extra gap for sticky/fixed navbar */}
      <div className="mt-0 pt-0">
        {/* ========== HERO SECTION ========== */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <div className="space-y-6 text-center md:text-left">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                  <FaShieldAlt className="inline mr-2" />
                  Trusted Healthcare Platform
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  Book Appointment With{" "}
                  <span className="text-yellow-300">Trusted Doctors</span>
                </h1>
                
                <p className="text-lg md:text-xl text-blue-50 leading-relaxed">
                  Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free and get expert medical care anytime, anywhere.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                    <FaSearch className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search doctors, specialties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <FaSearch />
                    <span>Search</span>
                  </button>
                </form>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-6">
                  <div className="text-center md:text-left">
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300">500+</div>
                    <div className="text-sm text-blue-100">Verified Doctors</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300">50k+</div>
                    <div className="text-sm text-blue-100">Happy Patients</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-3xl md:text-4xl font-bold text-yellow-300">4.8★</div>
                    <div className="text-sm text-blue-100">Average Rating</div>
                  </div>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-pink-400/30 rounded-3xl blur-2xl"></div>
                <img
                  src={assets.header_img}
                  alt="Doctor Consultation"
                  className="relative w-full rounded-3xl shadow-2xl border-4 border-white/20 hover:scale-105 transition-transform duration-500"
                />
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <FaCheckCircle className="text-3xl text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">100% Verified</div>
                    <div className="text-sm text-gray-500">Licensed Doctors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== SPECIALIZATIONS SECTION ========== */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Find by <span className="text-blue-600">Specialization</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Browse through our wide range of medical specializations and find the right doctor for your needs.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {specialityData.map((item, index) => (
                <Link
                  key={index}
                  to={`/doctors?speciality=${encodeURIComponent(item.speciality)}`}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 text-center hover:-translate-y-2 border-2 border-transparent hover:border-blue-500"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img src={item.image} alt={item.speciality} className="w-12 h-12" />
                  </div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {item.speciality}
                  </h3>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View All Specializations
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* ========== TOP DOCTORS SECTION ========== */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Top <span className="text-blue-600">Doctors</span> to Book
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Meet our highly qualified and experienced doctors ready to provide you with exceptional care.
              </p>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                <div className="col-span-4 text-center py-10">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-gray-600">Loading doctors...</p>
                </div>
              ) : error ? (
                <div className="col-span-4 text-center py-10">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : topDoctors.length === 0 ? (
                <div className="col-span-4 text-center py-10">
                  <p className="text-gray-600">No doctors found.</p>
                </div>
              ) : (
                topDoctors.map((doctor, index) => (
                  <div
                    key={doctor.id || index}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-2"
                  >
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
                      <img
                        src={doctor.photo || doctor.image || "https://via.placeholder.com/300x200?text=Doctor"}
                        alt={doctor.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {doctor.available !== false && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <FaCheckCircle /> Available
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.name}</h3>
                      <p className="text-blue-600 font-semibold mb-3">{doctor.specialty || doctor.speciality}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <FaStethoscope className="text-blue-500" />
                          <span>{doctor.experience || "-"} yrs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaStar className="text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-gray-800">Rs. {doctor.fee || doctor.fees}</div>
                        <Link
                          to={`/book/${doctor.id || doctor._id}`}
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                        >
                          Book
                          <FaArrowRight />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/doctors"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                View All Doctors
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* ========== HOW IT WORKS SECTION ========== */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                How It <span className="text-blue-600">Works</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Simple, fast, and secure. Book your appointment in just three easy steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-cyan-400" style={{ width: '66%', left: '17%' }}></div>

              {/* Step 1 */}
              <div className="relative text-center group">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                    <FaSearch className="text-5xl text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">1</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Find Your Doctor</h3>
                <p className="text-gray-600 leading-relaxed">
                  Search for doctors by specialty, location, or name. Browse profiles, ratings, and availability.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center group">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                    <FaCalendarAlt className="text-5xl text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">2</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Book Appointment</h3>
                <p className="text-gray-600 leading-relaxed">
                  Select your preferred date and time slot. Confirm your booking instantly with secure payment.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center group">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300 border-4 border-white">
                    <FaVideo className="text-5xl text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">3</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Get Consultation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Meet your doctor online via video call or visit in person. Receive expert medical care.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== WHY CHOOSE US SECTION ========== */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Why Choose <span className="text-blue-600">MediCare</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We provide the best healthcare experience with cutting-edge technology and compassionate care.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-2 border-blue-100 hover:border-blue-300 hover:-translate-y-2">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FaAward className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Certified Doctors</h3>
                <p className="text-gray-600">All doctors are verified and licensed medical professionals.</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-2 border-green-100 hover:border-green-300 hover:-translate-y-2">
                <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FaShieldAlt className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Secure & Private</h3>
                <p className="text-gray-600">Your health data is encrypted and completely confidential.</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-2 border-purple-100 hover:border-purple-300 hover:-translate-y-2">
                <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FaClock className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">24/7 Support</h3>
                <p className="text-gray-600">Round-the-clock customer support for all your queries.</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border-2 border-orange-100 hover:border-orange-300 hover:-translate-y-2">
                <div className="bg-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FaHeadset className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Easy Booking</h3>
                <p className="text-gray-600">Simple interface to book appointments in minutes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== TESTIMONIALS SECTION ========== */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                What Our <span className="text-blue-600">Patients Say</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real stories from real patients who found quality care through our platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative border-t-4 border-blue-500">
                <div className="absolute -top-6 left-8 bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <FaStar className="text-white text-xl" />
                </div>
                <div className="flex gap-1 mb-4 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-lg mb-6 italic leading-relaxed">
                  "Booking appointments online is so convenient! I saved so much time and got the care I needed quickly. The doctors are professional and caring."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
                    JD
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">Jane Doe</h4>
                    <p className="text-gray-500 text-sm">Patient since 2024</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative border-t-4 border-green-500">
                <div className="absolute -top-6 left-8 bg-green-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <FaStar className="text-white text-xl" />
                </div>
                <div className="flex gap-1 mb-4 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-lg mb-6 italic leading-relaxed">
                  "The platform is user-friendly and secure. I can easily find specialists in my area. The doctors are professional and responsive. Highly recommended!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold text-xl">
                    RK
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">Raj Kumar</h4>
                    <p className="text-gray-500 text-sm">Patient since 2023</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 relative border-t-4 border-purple-500">
                <div className="absolute -top-6 left-8 bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                  <FaStar className="text-white text-xl" />
                </div>
                <div className="flex gap-1 mb-4 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-lg mb-6 italic leading-relaxed">
                  "Amazing experience! The online consultation was seamless. I could manage my appointments from anywhere. The support team is very helpful."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
                    SP
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">Sita Patel</h4>
                    <p className="text-gray-500 text-sm">Patient since 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== STATS SECTION ========== */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-5xl md:text-6xl font-extrabold mb-3 text-yellow-300">500+</div>
                <div className="text-xl font-semibold text-blue-50 flex items-center justify-center gap-2">
                  <FaUserMd />
                  Verified Doctors
                </div>
              </div>
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-5xl md:text-6xl font-extrabold mb-3 text-yellow-300">50k+</div>
                <div className="text-xl font-semibold text-blue-50 flex items-center justify-center gap-2">
                  <FaUsers />
                  Happy Patients
                </div>
              </div>
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-5xl md:text-6xl font-extrabold mb-3 text-yellow-300">100k+</div>
                <div className="text-xl font-semibold text-blue-50 flex items-center justify-center gap-2">
                  <FaCalendarAlt />
                  Appointments
                </div>
              </div>
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-5xl md:text-6xl font-extrabold mb-3 text-yellow-300">25+</div>
                <div className="text-xl font-semibold text-blue-50 flex items-center justify-center gap-2">
                  <FaHospital />
                  Specializations
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== CALL TO ACTION SECTION ========== */}
        <section className="py-20 bg-gradient-to-br from-white to-blue-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl shadow-2xl p-12 relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-blue-50 mb-8 leading-relaxed max-w-2xl mx-auto">
                  Join thousands of patients who trust our platform for their healthcare needs. Book your first appointment today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-10 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Create Your Account
                    <FaArrowRight />
                  </Link>
                  <Link
                    to="/doctors"
                    className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-white/30"
                  >
                    Browse Doctors
                    <FaSearch />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Home;
