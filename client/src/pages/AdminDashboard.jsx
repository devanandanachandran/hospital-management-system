import { useState, useEffect } from 'react';
import API from '../api/axios';

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [historyPatientId, setHistoryPatientId] = useState(null);
  const [historyPatientName, setHistoryPatientName] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);

const viewPatientHistory = (patientId, patientName) => {
  const history = appointments.filter((appt) => appt.patient?._id === patientId);
  setPatientHistory(history);
  setHistoryPatientId(patientId);
  setHistoryPatientName(patientName);
};

const closeHistory = () => {
  setHistoryPatientId(null);
  setPatientHistory([]);
};

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
       <span
        onClick={() => viewPatientHistory(appt.patient._id, appt.patient.name)}
        style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
        {appt.patient?.name}
        </span>
        {' '}→ Dr. {appt.doctor?.name} — {new Date(appt.date).toLocaleDateString()} — {appt.status}
        </li>
       ))}
     </ul>

     {historyPatientId && (
  <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1.5rem' }}>
    <h4>Full History for {historyPatientName}</h4>
    <button onClick={closeHistory}>Close</button>
    {patientHistory.length === 0 ? (
      <p>No appointments found</p>
    ) : (
      <ul>
        {patientHistory
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((visit) => (
            <li key={visit._id}>
              <p>{new Date(visit.date).toLocaleString()} — Dr. {visit.doctor?.name} — Status: {visit.status}</p>
              <p>Reason: {visit.reason}</p>
              {visit.prescription && <p>Prescription: {visit.prescription}</p>}
            </li>
          ))}
      </ul>
    )}
  </div>
)}    
    </div>
  );
}

export default AdminDashboard;