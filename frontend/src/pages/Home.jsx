import { Link } from "react-router-dom";
import { FaClock, FaUserMd, FaLaptop, FaSearch, FaCalendarAlt, FaVideo } from "react-icons/fa";
import { assets } from "../assets/assets/assets_frontend/assets.js";
import Navbar from "../components/Navbar"; // make sure path is correct

function Home() {
  return (
    <div className="font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Page content wrapper with padding-top for fixed navbar */}
      <div className="pt-24"> {/* Adjust pt-24 to match Navbar height */}
        {/* Hero Section with background image */}
        <section
          className="relative text-white py-24"
          style={{
            backgroundImage:
              `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3)), url(${assets.header_img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/50 z-0"></div>

          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:justify-between relative z-10">
            {/* Left */}
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
                Your Health, <br /> Our Priority
              </h1>
              <p className="mt-4 text-xl text-white/90 mb-6">
                Connect with top-rated doctors online. Schedule appointments effortlessly and receive quality healthcare from the comfort of your home.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/doctors"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold transition duration-300 shadow-lg"
                >
                  Find a Doctor
                </Link>
                <Link
                  to="/register"
                  className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="md:w-1/2 mt-10 md:mt-0">
              <img
                src={assets.appointment_img}
                alt="Doctor Consultation"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Why Choose Our Platform?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition duration-300 border-t-4 border-blue-500">
                <FaClock className="mx-auto text-5xl text-blue-600 mb-6" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Easy Booking</h3>
                <p className="text-gray-600 text-lg">Book appointments in just a few clicks with our intuitive interface.</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition duration-300 border-t-4 border-green-500">
                <FaUserMd className="mx-auto text-5xl text-green-600 mb-6" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Trusted Doctors</h3>
                <p className="text-gray-600 text-lg">Verified and experienced medical professionals ready to help you.</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition duration-300 border-t-4 border-purple-500">
                <FaLaptop className="mx-auto text-5xl text-purple-600 mb-6" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Fully Online</h3>
                <p className="text-gray-600 text-lg">No phone calls needed, everything is online and secure.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaSearch className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">1. Find Your Doctor</h3>
                <p className="text-gray-600 text-lg">Browse through our extensive list of qualified doctors by specialty, location, or rating.</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCalendarAlt className="text-3xl text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">2. Book Appointment</h3>
                <p className="text-gray-600 text-lg">Select your preferred time slot and confirm your appointment instantly.</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaVideo className="text-3xl text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">3. Get Consultation</h3>
                <p className="text-gray-600 text-lg">Connect with your doctor via secure video call or in-person visit.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-12 text-gray-800">What Our Patients Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <p className="text-gray-600 text-lg mb-6 italic">
                  "Booking appointments online is so convenient! I saved so much time and got the care I needed quickly."
                </p>
                <h4 className="font-semibold text-xl text-gray-800">– Jane D.</h4>
                <p className="text-gray-500">Patient</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <p className="text-gray-600 text-lg mb-6 italic">
                  "Doctors are professional and responsive. The platform is user-friendly and secure. Highly recommended!"
                </p>
                <h4 className="font-semibold text-xl text-gray-800">– Raj K.</h4>
                <p className="text-gray-500">Patient</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <p className="text-gray-600 text-lg mb-6 italic">
                  "The online system is fast and secure. I can easily manage my health appointments from anywhere."
                </p>
                <h4 className="font-semibold text-xl text-gray-800">– Sita P.</h4>
                <p className="text-gray-500">Patient</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of patients who trust our platform for their healthcare needs.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg text-lg"
            >
              Create Your Account
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-lg">&copy; {new Date().getFullYear()} Online Doctor Appointment System. All rights reserved.</p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;
