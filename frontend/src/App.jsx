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
import DoctorDetails from "./pages/DoctorDetails";
import AdminDashboard from "./pages/AdminDashboard"; // new
import MyDashboard from "./pages/MyDashboard";
import RequireAuth from './components/RequireAuth';
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
          <Route path="/doctor-dashboard" element={
            <RequireAuth allowedRoles={["DOCTOR"]}>
              <DoctorDashboard />
            </RequireAuth>
          } />
          <Route path="/doctor-details" element={
            <RequireAuth allowedRoles={["DOCTOR"]}>
              <DoctorDetails />
            </RequireAuth>
          } />
          <Route path="/admin-dashboard" element={
            <RequireAuth allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </RequireAuth>
          } />
          <Route path="/my-dashboard" element={
            <RequireAuth allowedRoles={["PATIENT"]}>
              <MyDashboard />
            </RequireAuth>
          } />
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
