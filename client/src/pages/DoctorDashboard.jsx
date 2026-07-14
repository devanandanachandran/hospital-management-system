import { useState, useEffect } from 'react';
import { Calendar, Users } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import API from '../api/axios';

function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [historyPatientId, setHistoryPatientId] = useState(null);
  const [historyPatientName, setHistoryPatientName] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);

  const navItems = [
    { key: 'schedule', label: 'My Schedule', icon: Calendar },
  ];

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
  <DashboardLayout
    title="Doctor Dashboard"
    roleLabel="Doctor"
    navItems={navItems}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    >
      {activeTab === 'schedule' && (
        <div className="max-w-3xl space-y-6">

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

{historyPatientId && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">History — {historyPatientName}</h3>
        <button onClick={closeHistory} className="text-slate-400 hover:text-slate-600">✕</button>
      </div>

      {patientHistory.length === 0 ? (
        <p className="text-sm text-slate-500">No past visits with this patient</p>
      ) : (
        <div className="space-y-3">
          {patientHistory.map((visit) => (
            <div key={visit._id} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-900">
                  {new Date(visit.date).toLocaleDateString()}
                </span>
                <StatusBadge status={visit.status} />
              </div>
              <p className="text-sm text-slate-500 mb-1">{visit.reason}</p>
              {visit.prescription && (
                <p className="text-sm text-slate-600 bg-slate-50 rounded p-2 mt-1">{visit.prescription}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
         {Object.keys(groupedAppointments).length === 0 ? (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
    No upcoming appointments
  </div>
) : (
  Object.entries(groupedAppointments).map(([date, appts]) => (
    <div key={date}>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">{date}</h3>
      <div className="space-y-3">
        {appts.map((appt) => (
          <div key={appt._id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <button
                  onClick={() => viewPatientHistory(appt.patient._id, appt.patient.name)}
                  className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {appt.patient?.name}
                </button>
                <p className="text-sm text-slate-500">{appt.reason}</p>
              </div>
              <StatusBadge status={appt.status} />
            </div>

            <p className="text-sm text-slate-500 mb-4">
              {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>

            <div className="flex items-center gap-3">
              {appt.status === 'pending' && (
                <button
                  onClick={() => handleConfirm(appt._id)}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  Confirm
                </button>
              )}

              {editingId !== appt._id && (
                <button
                  onClick={() => startEditing(appt)}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                >
                  {appt.prescription ? 'Edit Prescription' : 'Add Prescription'}
                </button>
              )}
            </div>

            {editingId === appt._id && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Write prescription..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSavePrescription(appt._id)}
                    className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Save & Mark Completed
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  ))
)}
    </div>
      )}
   </DashboardLayout>
);
}

export default DoctorDashboard;