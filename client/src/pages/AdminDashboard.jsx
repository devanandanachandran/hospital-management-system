import { useState, useEffect } from 'react';
import { UserPlus, ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import API from '../api/axios';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [historyPatientId, setHistoryPatientId] = useState(null);
  const [historyPatientName, setHistoryPatientName] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);

  const navItems = [
    { key: 'overview', label: 'Overview', icon: ClipboardList },
    { key: 'doctors', label: 'Manage Doctors', icon: UserPlus },
  ];

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
    <DashboardLayout
      title="Admin Dashboard"
      roleLabel="Administrator"
      navItems={navItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
           <div className="grid grid-cols-3 gap-4">
  <div className="bg-white rounded-2xl border border-slate-200 p-5">
    <p className="text-sm text-slate-500 mb-1">Total Doctors</p>
    <p className="text-2xl font-semibold text-slate-900">{doctors.length}</p>
  </div>
  <div className="bg-white rounded-2xl border border-slate-200 p-5">
    <p className="text-sm text-slate-500 mb-1">Total Appointments</p>
    <p className="text-2xl font-semibold text-slate-900">{appointments.length}</p>
  </div>
  <div className="bg-white rounded-2xl border border-slate-200 p-5">
    <p className="text-sm text-slate-500 mb-1">Pending</p>
    <p className="text-2xl font-semibold text-amber-500">
      {appointments.filter(a => a.status === 'pending').length}
    </p>
  </div>
</div>

<div>
  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">All Appointments</h3>
  <div className="space-y-3">
    {appointments.length === 0 ? (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
        No appointments in the system yet
      </div>
    ) : (
      appointments.map((appt) => (
        <div key={appt._id} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <button
                onClick={() => viewPatientHistory(appt.patient._id, appt.patient.name)}
                className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
              >
                {appt.patient?.name}
              </button>
              <p className="text-sm text-slate-500">with Dr. {appt.doctor?.name}</p>
            </div>
            <StatusBadge status={appt.status} />
          </div>
          <p className="text-sm text-slate-500">
            {new Date(appt.date).toLocaleDateString()} at{' '}
            {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ))
    )}
  </div>
</div>

          </div>
      )}
      {activeTab === 'doctors' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
  <h2 className="text-base font-semibold text-slate-900 mb-1">Add Doctor</h2>
  <p className="text-sm text-slate-500 mb-5">Create a new doctor account for the system</p>

  {message && (
    <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg px-3 py-2 mb-4">
      {message}
    </div>
  )}

  <form onSubmit={handleCreateDoctor} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
      <input
        type="text" name="name" value={formData.name} onChange={handleChange} required
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
      <input
        type="email" name="email" value={formData.email} onChange={handleChange} required
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
      <input
        type="password" name="password" value={formData.password} onChange={handleChange} required
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <button
      type="submit"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
    >
      Create Doctor Account
    </button>
  </form>
</div>

<div>
  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
    All Doctors ({doctors.length})
  </h3>
  <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
    {doctors.map((doc) => (
      <div key={doc._id} className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
          {doc.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">{doc.name}</p>
          <p className="text-xs text-slate-500">{doc.email}</p>
        </div>
      </div>
    ))}
  </div>
</div>
</div>
      )}

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
        </DashboardLayout>
  );

}

export default AdminDashboard;