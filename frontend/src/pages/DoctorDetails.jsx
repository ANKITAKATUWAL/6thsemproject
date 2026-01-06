import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function DoctorDetails() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    specialty: '',
    experience: '',
    fee: '',
    availability: '', // comma-separated
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user name if changed
      if (form.name && form.name !== user?.name) {
        await axios.put('http://localhost:5000/api/auth/me', { name: form.name }, { withCredentials: true });
      }

      // Create/Update doctor profile
      const profilePayload = {
        specialty: form.specialty,
        experience: form.experience,
        fee: form.fee,
        bio: form.bio
      };

      await axios.put('http://localhost:5000/api/appointments/doctor/profile', profilePayload, { withCredentials: true });

      // Availability
      const slots = form.availability.split(',').map(s => s.trim()).filter(Boolean);
      if (slots.length > 0) {
        await axios.put('http://localhost:5000/api/appointments/doctor/availability', { timeSlots: slots }, { withCredentials: true });
      }

      toast.success('Profile saved');

      // Refresh auth user by fetching /me and updating context
      const me = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
      login(me.data.user);

      navigate('/doctor-dashboard');
    } catch (err) {
      console.error('Save doctor details error:', err);
      const msg = err?.response?.data?.message || 'Failed to save details';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Complete Your Doctor Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Specialty</label>
          <input name="specialty" value={form.specialty} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Experience (years)</label>
            <input name="experience" value={form.experience} onChange={handleChange} type="number" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Consultation Fee</label>
            <input name="fee" value={form.fee} onChange={handleChange} type="number" className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Availability (comma separated times)</label>
          <input name="availability" value={form.availability} onChange={handleChange} placeholder="09:00,10:00,14:00" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">About / Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={4} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
