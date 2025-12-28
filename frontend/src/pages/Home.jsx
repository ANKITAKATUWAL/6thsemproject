import { Link } from "react-router-dom";
import { FaClock, FaUserMd, FaLaptop } from "react-icons/fa";
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
          className="relative text-white py-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1588776814546-95b7d62aaf6d?auto=format&fit=crop&w=1470&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-black/40 z-0"></div>

          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:justify-between relative z-10">
            {/* Left */}
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Book Appointments <br /> With Trusted Doctors
              </h1>
              <p className="mt-4 text-lg text-white/90">
                Schedule your doctor appointments online easily. Fast, simple, and secure.
              </p>
              <Link
                to="/doctors"
                className="inline-block mt-6 bg-white text-blue-600 px-6 py-3 rounded font-semibold hover:bg-gray-100 transition"
              >
                Book Appointment
              </Link>
            </div>

            {/* Right */}
            <div className="md:w-1/2 mt-10 md:mt-0">
              <img
                src="https://img.freepik.com/free-vector/doctor-consultation-illustration_23-2148512074.jpg"
                alt="Doctor"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded shadow text-center hover:shadow-lg transition">
                <FaClock className="mx-auto text-4xl text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-gray-600">Book appointments in just a few clicks.</p>
              </div>

              <div className="bg-white p-6 rounded shadow text-center hover:shadow-lg transition">
                <FaUserMd className="mx-auto text-4xl text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trusted Doctors</h3>
                <p className="text-gray-600">Verified and experienced medical professionals.</p>
              </div>

              <div className="bg-white p-6 rounded shadow text-center hover:shadow-lg transition">
                <FaLaptop className="mx-auto text-4xl text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fully Online</h3>
                <p className="text-gray-600">No phone calls needed, everything is online.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-10">What Our Users Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border rounded shadow hover:shadow-lg transition">
                <p className="text-gray-600 mb-4">
                  "Booking appointments online is so convenient! I saved so much time."
                </p>
                <h4 className="font-semibold">– Jane D.</h4>
              </div>
              <div className="p-6 border rounded shadow hover:shadow-lg transition">
                <p className="text-gray-600 mb-4">
                  "Doctors are professional and responsive. Highly recommended!"
                </p>
                <h4 className="font-semibold">– Raj K.</h4>
              </div>
              <div className="p-6 border rounded shadow hover:shadow-lg transition">
                <p className="text-gray-600 mb-4">
                  "The online system is fast and secure. Very user-friendly."
                </p>
                <h4 className="font-semibold">– Sita P.</h4>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-blue-600 text-white py-6 mt-10">
          <div className="max-w-6xl mx-auto px-6 text-center">
            &copy; {new Date().getFullYear()} Online Doctor Appointment. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;
rism