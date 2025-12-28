import { useParams, Link } from "react-router-dom";
import { doctorsData } from "../data/doctors";
import { useState } from "react";

function BookAppointment() {
  const { id } = useParams();
  const doctor = doctorsData.find((d) => d.id === parseInt(id));
  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    date: "",
    time: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (!doctor) return <p className="text-center mt-10 text-red-500">Doctor not found</p>;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log("Appointment booked:", doctor.name, form);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <Link to={`/doctors`} className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Back to Doctors
      </Link>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Book Appointment with {doctor.name}
      </h2>

      {submitted ? (
        <p className="text-green-600 font-bold text-center">
          Appointment booked successfully!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "age", "phone", "date", "time"].map((field) => (
            <div key={field}>
              <label className="block text-gray-700 font-semibold capitalize">{field}:</label>
              <input
                type={field === "age" ? "number" : field === "phone" ? "tel" : field === "date" ? "date" : field === "time" ? "time" : "text"}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Confirm Appointment
          </button>
        </form>
      )}
    </div>
  );
}

export default BookAppointment;
