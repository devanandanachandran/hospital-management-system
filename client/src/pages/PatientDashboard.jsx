import { useState, useEffect } from 'react';
import API from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import { Calendar, ClipboardList, Clock, FileText } from 'lucide-react';
import { generatePrescriptionPDF } from '../utils/generatePrescriptionPDF';
import { Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';

function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctor: '', date: '', reason: '' });
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [activeTab, setActiveTab] = useState('book');
  const { showToast } = useToast();
  const [doctorSearch, setDoctorSearch] = useState('');
  const [apptSearch, setApptSearch] = useState('');

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
    showToast('Appointment booked successfully');
    setFormData({ doctor: '', date: '', reason: '' });
    fetchAppointments();
  } catch (err) {
    showToast(err.response?.data?.message || 'Something went wrong', 'error');
  }
};

     const handleCancel = async (id) => {
  const confirmed = window.confirm('Are you sure you want to cancel this appointment?');
  if (!confirmed) return;

  try {
    await API.put(`/appointments/${id}/cancel`);
    showToast('Appointment cancelled');
    fetchAppointments();
  } catch (err) {
    showToast('Something went wrong', 'error');
  }
};

const filteredDoctors = doctors.filter((doc) =>
  doc.name.toLowerCase().includes(doctorSearch.toLowerCase())
);

const filteredAppointments = appointments.filter((appt) =>
  appt.doctor?.name?.toLowerCase().includes(apptSearch.toLowerCase()) ||
  appt.reason?.toLowerCase().includes(apptSearch.toLowerCase())
);

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

  return (
    <DashboardLayout
      title="Patient Dashboard"
      roleLabel="Patient"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="grid grid-cols-3 gap-4 mb-6 max-w-2xl">
        <div className="bg-white rounded-[14px] border border-brand-100 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <p className="text-xs font-medium text-brand-500/70 mb-1">Total Appointments</p>
          <p className="text-2xl font-bold text-brand-700">{appointments.length}</p>
        </div>
        <div className="bg-white rounded-[14px] border border-brand-100 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <p className="text-xs font-medium text-brand-500/70 mb-1">Pending</p>
          <p className="text-2xl font-bold text-accent-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-[14px] border border-brand-100 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <p className="text-xs font-medium text-brand-500/70 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-600">{confirmedCount}</p>
        </div>
      </div>

      {activeTab === 'book' && (
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl border border-brand-100 p-6 animate-rise">
            <h2 className="text-base font-semibold text-brand-900 mb-1">Book an Appointment</h2>
            <p className="text-sm text-brand-500/70 mb-5">Choose a doctor, date, and available time slot</p>

            {message && (
              <div className="bg-brand-50 border border-brand-200 text-brand-700 text-sm rounded-lg px-3 py-2 mb-4">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Doctor</label>
                   <SearchInput
  value={doctorSearch}
  onChange={(e) => setDoctorSearch(e.target.value)}
  placeholder="Search doctors..."
/>

<select name="doctor" value={formData.doctor} onChange={handleDoctorOrDateChange} required className="...">
  <option value="">Select a doctor</option>
  {filteredDoctors.map((doc) => (
    <option key={doc._id} value={doc._id}>{doc.name}</option>
  ))}
</select>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  required
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Time Slot</label>
                <select
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
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
                <label className="block text-sm font-medium text-brand-700 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  name="reason"
                  placeholder="e.g. Routine checkup"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-br from-brand-600 to-brand-800 hover:shadow-lg hover:-translate-y-0.5 text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
              >
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-3 max-w-2xl">
          <SearchInput
  value={apptSearch}
  onChange={(e) => setApptSearch(e.target.value)}
  placeholder="Search by doctor or reason..."
/>
          {appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center text-brand-500/70 text-sm">
              No appointments yet. Book one to get started.
            </div>
            
          ) : (
            filteredAppointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-2xl border border-brand-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-brand-900">Dr. {appt.doctor?.name}</h3>
                    <p className="text-sm text-brand-500/70">{appt.reason}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>

                <div className="flex items-center gap-4 text-sm text-brand-500/70 mb-3">
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
                  <div className="flex items-start gap-1.5 text-sm text-brand-700 bg-brand-50 rounded-lg p-3 mb-3">
                    <FileText size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{appt.prescription}</span>
                  </div>
                )}

                {appt.prescription && (
  <button
    onClick={() => generatePrescriptionPDF(appt)}
    className="text-sm text-blue-600 hover:underline flex items-center gap-1.5 mt-2"
  >
    <Download size={14} />
    Download Prescription PDF
  </button>
)}

                {appt.reportUrl && (
  
   <a href={appt.reportUrl} 
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-blue-600 hover:underline flex items-center gap-1.5 mt-2"
   >
    📄 View {appt.reportName}
  </a>
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
