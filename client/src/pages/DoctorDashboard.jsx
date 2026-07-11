import { useState, useEffect } from 'react';
import API from '../api/axios';

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [historyPatientId, setHistoryPatientId] = useState(null);
  const [historyPatientName, setHistoryPatientName] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);

const viewPatientHistory = async (patientId, patientName) => {
  try {
    const res = await API.get(`/appointments/patient-history/${patientId}`);
    setPatientHistory(res.data);
    setHistoryPatientId(patientId);
    setHistoryPatientName(patientName);
  } catch (err) {
    console.error(err);
  }
};

const closeHistory = () => {
  setHistoryPatientId(null);
  setPatientHistory([]);
};

  const fetchAppointments = async () => {
    try {
      const res = await API.get('/appointments/doctor-appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const startEditing = (appt) => {
    setEditingId(appt._id);
    setPrescription(appt.prescription || '');
  };

  const handleSavePrescription = async (id) => {
    try {
      await API.put(`/appointments/${id}`, {
        prescription,
        status: 'completed'
      });
      setEditingId(null);
      setPrescription('');
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await API.put(`/appointments/${id}`, { status: 'confirmed' });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const groupByDate = (appts) => {
  const groups = {};
  appts.forEach((appt) => {
    const dateKey = new Date(appt.date).toLocaleDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(appt);
  });
  return groups;
  };

  const groupedAppointments = groupByDate(
  appointments
    .filter(a => a.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  );

  return (
    <div>
      <h2>Doctor Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <h3>My Schedule</h3>
      {historyPatientId && (
  <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1.5rem' }}>
    <h4>History for {historyPatientName}</h4>
    <button onClick={closeHistory}>Close</button>
    {patientHistory.length === 0 ? (
      <p>No past visits with this patient</p>
    ) : (
      <ul>
        {patientHistory.map((visit) => (
          <li key={visit._id}>
            <p>{new Date(visit.date).toLocaleString()} — Status: {visit.status}</p>
            <p>Reason: {visit.reason}</p>
            {visit.prescription && <p>Prescription: {visit.prescription}</p>}
          </li>
        ))}
      </ul>
    )}
  </div>
)}
         {Object.keys(groupedAppointments).length === 0 ? (
  <p>No upcoming appointments</p>
) : (
  Object.entries(groupedAppointments).map(([date, appts]) => (
    <div key={date} style={{ marginBottom: '1.5rem' }}>
      <h4>{date}</h4>
      <ul>
        {appts.map((appt) => (
          <li key={appt._id} style={{ marginBottom: '1rem' }}>
            <p>
              {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —{' '}
              <span
                onClick={() => viewPatientHistory(appt.patient._id, appt.patient.name)}
                style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                >
              {appt.patient?.name}
              </span>
            </p>
            <p>Reason: {appt.reason}</p>
            <p>Status: {appt.status}</p>

            {appt.status === 'pending' && (
              <button onClick={() => handleConfirm(appt._id)}>Confirm Appointment</button>
            )}

            {editingId === appt._id ? (
              <div>
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Write prescription..."
                />
                <button onClick={() => handleSavePrescription(appt._id)}>Save & Mark Completed</button>
              </div>
            ) : (
              <button onClick={() => startEditing(appt)}>
                {appt.prescription ? 'Edit Prescription' : 'Add Prescription'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  ))
)}
    </div>
  );
}

export default DoctorDashboard;