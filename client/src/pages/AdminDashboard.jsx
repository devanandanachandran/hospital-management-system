import { useState, useEffect } from 'react';
import API from '../api/axios';

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const fetchDoctors = async () => {
    const res = await API.get('/auth/doctors');
    setDoctors(res.data);
  };

  const fetchAppointments = async () => {
    const res = await API.get('/appointments/all');
    setAppointments(res.data);
  };

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/create-doctor', formData);
      setMessage('Doctor created successfully');
      setFormData({ name: '', email: '', password: '' });
      fetchDoctors();
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
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>Add Doctor</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleCreateDoctor}>
        <input
          type="text"
          name="name"
          placeholder="Doctor Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Temporary Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Doctor</button>
      </form>

      <h3>All Doctors ({doctors.length})</h3>
      <ul>
        {doctors.map((doc) => (
          <li key={doc._id}>{doc.name} — {doc.email} — ID: {doc._id}</li>
        ))}
      </ul>

      <h3>All Appointments ({appointments.length})</h3>
      <ul>
        {appointments.map((appt) => (
          <li key={appt._id}>
            {appt.patient?.name} → Dr. {appt.doctor?.name} — {new Date(appt.date).toLocaleDateString()} — {appt.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;