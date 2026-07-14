import { useState, useEffect } from 'react';
import API from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { Calendar,ClipboardList, Clock, FileText } from 'lucide-react';


function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctor: '', date: '', reason: '' });
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [activeTab, setActiveTab] = useState('book');
  
  const navItems = [
    { key: 'book', label: 'Book Appointment', icon: Calendar },
    { key: 'appointments', label: 'My Appointments', icon: ClipboardList },
  ];

const fetchSlots = async (doctorId, date) => {
  if (!doctorId || !date) return;
  try {
    const res = await API.get(`/appointments/available-slots/${doctorId}?date=${date}`);
    setAvailableSlots(res.data);
  } catch (err) {
    console.error(err);
  }
};

// call this whenever doctor or date changes
const handleDoctorOrDateChange = (e) => {
  const updated = { ...formData, [e.target.name]: e.target.value };
  setFormData(updated);
  fetchSlots(updated.doctor, selectedDate);
};

const handleDateChange = (e) => {
  setSelectedDate(e.target.value);
  fetchSlots(formData.doctor, e.target.value);
};


  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments/my-appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
  const res = await API.get('/auth/doctors');
  setDoctors(res.data);
};

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/appointments', formData);
      setMessage('Appointment booked successfully');
      setFormData({ doctor: '', date: '', reason: '' });
      fetchAppointments(); // refresh the list
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  

  const handleCancel = async (id) => {
  const confirmed = window.confirm('Are you sure you want to cancel this appointment?');
  if (!confirmed) return;

  try {
    await API.put(`/appointments/${id}/cancel`);
    fetchAppointments();
  } catch (err) {
    console.error(err);
  }
 };

  return (
  <DashboardLayout
    title="Patient Dashboard"
    roleLabel="Patient"
    navItems={navItems}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    >
      
      

      {activeTab === 'book' && (
  <div className="max-w-lg">
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Book an Appointment</h2>
      <p className="text-sm text-slate-500 mb-5">Choose a doctor, date, and available time slot</p>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-3 py-2 mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Doctor</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleDoctorOrDateChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a doctor</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Time Slot</label>
          <select
            name="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a time slot</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </option>
            ))}
          </select>
          {formData.doctor && selectedDate && availableSlots.length === 0 && (
            <p className="text-xs text-red-500 mt-1">No slots available for this date</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit</label>
          <input
            type="text"
            name="reason"
            placeholder="e.g. Routine checkup"
            value={formData.reason}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          Book Appointment
        </button>
      </form>
    </div>
  </div>
)}


{activeTab === 'appointments' && (
  <div className="space-y-3 max-w-2xl">
    {appointments.length === 0 ? (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
        No appointments yet. Book one to get started.
      </div>
    ) : (
      appointments.map((appt) => (
        <div key={appt._id} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-slate-900">Dr. {appt.doctor?.name}</h3>
              <p className="text-sm text-slate-500">{appt.reason}</p>
            </div>
            <StatusBadge status={appt.status} />
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(appt.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {appt.prescription && (
            <div className="flex items-start gap-1.5 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 mb-3">
              <FileText size={14} className="mt-0.5 flex-shrink-0" />
              <span>{appt.prescription}</span>
            </div>
          )}

          {(appt.status === 'pending' || appt.status === 'confirmed') && (
            <button
              onClick={() => handleCancel(appt._id)}
              className="text-sm text-red-500 font-medium hover:underline"
            >
              Cancel Appointment
            </button>
          )}
        </div>
      ))
    )}
  </div>
)}
        </DashboardLayout>
  );
}


export default PatientDashboard;