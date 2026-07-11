import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Calendar, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

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
      <>
      <h3>Book an Appointment</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <select
            name="doctor"
            value={formData.doctor}
            onChange={handleDoctorOrDateChange}
            required>

  <option value="">Select a doctor</option>
  {doctors.map((doc) => (
    <option key={doc._id} value={doc._id}>{doc.name}</option>
  ))}
</select>
          <input
           type="date"
           value={selectedDate}
           onChange={handleDateChange}
           required
          />

                <select
  name="date"
  value={formData.date}
  onChange={(e) =>
    setFormData({ ...formData, date: e.target.value })
  }
  required
>
  <option value="">Select a time slot</option>

  {availableSlots.map((slot) => (
    <option key={slot} value={slot}>
      {new Date(slot).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })}
    </option>
  ))}
</select>


        <input
          type="text"
          name="reason"
          placeholder="Reason for visit"
          value={formData.reason}
          onChange={handleChange}
          required
        />
        <button type="submit">Book Appointment</button>
      </form>
       </>
)}

      {activeTab === 'appointments' && (
      <>
      <h3>My Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments yet</p>
      ) : (
        <ul>
            {appointments.map((appt) => (
            <li key={appt._id}>
             Dr. {appt.doctor?.name} — {new Date(appt.date).toLocaleString()} — {appt.reason} — Status: {appt.status}
            {appt.prescription && <p>Prescription: {appt.prescription}</p>}
           {(appt.status === 'pending' || appt.status === 'confirmed') && (
           <button onClick={() => handleCancel(appt._id)}>Cancel Appointment</button>
            )}
          </li>
          ))}
        </ul>
      )}
      </>
     )}
        </DashboardLayout>
  );
}


export default PatientDashboard;