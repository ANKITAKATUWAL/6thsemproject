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
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo) {
      toast.error('Please select a photo first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', photo);

      const response = await axios.post(
        'http://localhost:5000/api/appointments/doctor/photo',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setUploadedPhotoPath(response.data.photo);
      toast.success('Photo uploaded successfully!');
    } catch (err) {
      console.error('Photo upload error:', err);
      const msg = err?.response?.data?.message || 'Failed to upload photo';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

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
        bio: form.bio,
        ...(uploadedPhotoPath ? { photo: uploadedPhotoPath } : {})
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
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl animate-fade-in">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-700 drop-shadow-lg">Complete Your Doctor Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload Section */}
        <div className="flex flex-col items-center mb-8">
          <label className="block text-sm font-semibold mb-2">Profile Photo</label>
          <div className="flex flex-col items-center gap-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Photo preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-md">
                <span className="text-gray-500 text-sm text-center">No photo<br/>selected</span>
              </div>
            )}
            <div className="flex gap-2">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl border font-semibold">
                <span>{photo ? 'Change Photo' : 'Select Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {photo && !uploadedPhotoPath && (
                <button
                  type="button"
                  onClick={handlePhotoUpload}
                  disabled={uploading}
                  className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              )}
            </div>
            {uploadedPhotoPath && (
              <p className="text-green-600 text-sm">✓ Photo uploaded successfully</p>
            )}
            <p className="text-gray-500 text-xs">Max size: 5MB. Formats: JPEG, PNG, GIF, WebP</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border border-blue-200 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-semibold">Specialty</label>
          <input name="specialty" value={form.specialty} onChange={handleChange} required className="w-full border border-blue-200 rounded-xl px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold">Experience (years)</label>
            <input name="experience" value={form.experience} onChange={handleChange} type="number" className="w-full border border-blue-200 rounded-xl px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-semibold">Consultation Fee</label>
            <input name="fee" value={form.fee} onChange={handleChange} type="number" className="w-full border border-blue-200 rounded-xl px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold">Availability <span className="text-xs text-gray-500">(comma separated times)</span></label>
          <input name="availability" value={form.availability} onChange={handleChange} placeholder="09:00,10:00,14:00" className="w-full border border-blue-200 rounded-xl px-3 py-2" />
          <p className="text-xs text-blue-500 mt-1">Example: 09:00, 10:00, 14:00</p>
        </div>
        <div>
          <label className="block text-sm font-semibold">About / Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full border border-blue-200 rounded-xl px-3 py-2" rows={4} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:scale-105 hover:shadow-xl transition-all duration-200">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
      {/* Animations (Tailwind custom classes, add to your CSS if not present) */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
