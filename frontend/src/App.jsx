import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import BookAppointment from "./pages/BookAppointment"; // new
import DoctorDashboard from "./pages/DoctorDashboard"; // new
import AdminDashboard from "./pages/AdminDashboard"; // new
import UserDashboard from "./pages/UserDashboard"; // new
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="pt-24 bg-gray-50 min-h-screen text-gray-800">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorProfile />} />
          <Route path="/book/:id" element={<BookAppointment />} /> {/* new */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} /> {/* new */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} /> {/* new */}
          <Route path="/user-dashboard" element={<UserDashboard />} /> {/* new */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
