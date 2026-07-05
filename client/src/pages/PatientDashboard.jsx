import { useState, useEffect } from 'react';
import API from '../api/axios';

function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({ doctor: '', date: '', reason: '' });
  const [message, setMessage] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments/my-appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div>
      <h2>Patient Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>Book an Appointment</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="doctor"
          placeholder="Doctor ID"
          value={formData.doctor}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
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

      <h3>My Appointments</h3>
      {appointments.length === 0 ? (
        <p>No appointments yet</p>
      ) : (
        <ul>
          {appointments.map((appt) => (
            <li key={appt._id}>
              Dr. {appt.doctor?.name} — {new Date(appt.date).toLocaleDateString()} — {appt.reason} — Status: {appt.status} - Prescription: {appt.prescription}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PatientDashboard;