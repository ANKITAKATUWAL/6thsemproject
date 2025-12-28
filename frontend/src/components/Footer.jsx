import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 mt-20 border-t">
      
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-2xl font-semibold text-blue-600 mb-3">
            MediCare
          </h2>
          <p className="text-sm leading-relaxed">
            Find trusted doctors and book medical appointments easily and
            securely.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-blue-600 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/doctors" className="hover:text-blue-600 transition">
                Doctors
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-blue-600 transition">
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase">
            Services
          </h3>
          <ul className="space-y-2 text-sm">
            <li>Online Appointments</li>
            <li>Doctor Consultation</li>
            <li>Health Records</li>
            <li>Support</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase">
            Contact
          </h3>
          <ul className="space-y-2 text-sm">
            <li>Kathmandu, Nepal</li>
            <li>+977-98XXXXXXXX</li>
            <li>support@medicare.com</li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center py-4 text-xs text-gray-500 border-t">
        © {new Date().getFullYear()} MediCare. All rights reserved.
      </div>
    </footer>
  );
}
