import { useState, useEffect } from 'react';
import { UserPlus, ClipboardList, ShieldCheck } from 'lucide-react';
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

  const [adminForm, setAdminForm] = useState({
  name: '',
  email: '',
  password: ''
});

const [adminMessage, setAdminMessage] = useState('');

  const navItems = [
  { key: 'overview', label: 'Overview', icon: ClipboardList },
  { key: 'doctors', label: 'Manage Doctors', icon: UserPlus },
  { key: 'admins', label: 'Manage Admins', icon: ShieldCheck },
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

  const handleAdminChange = (e) => {
  setAdminForm({
    ...adminForm,
    [e.target.name]: e.target.value
  });
};

const handleCreateAdmin = async (e) => {
  e.preventDefault();
  setAdminMessage('');

  try {
    await API.post('/auth/create-admin', adminForm);
    setAdminMessage('Admin account created successfully');
    setAdminForm({
      name: '',
      email: '',
      password: ''
    });
  } catch (err) {
    setAdminMessage(
      err.response?.data?.message || 'Something went wrong'
    );
  }
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
            <div className="bg-white rounded-[14px] border border-brand-100 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <p className="text-sm text-brand-500/70 mb-1">Total Doctors</p>
              <p className="text-2xl font-bold text-brand-700">{doctors.length}</p>
            </div>
            <div className="bg-white rounded-[14px] border border-brand-100 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <p className="text-sm text-brand-500/70 mb-1">Total Appointments</p>
              <p className="text-2xl font-bold text-brand-700">{appointments.length}</p>
            </div>
            <div className="bg-white rounded-[14px] border border-brand-100 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <p className="text-sm text-brand-500/70 mb-1">Pending</p>
              <p className="text-2xl font-bold text-accent-600">
                {appointments.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-brand-500/70 uppercase tracking-wide mb-3">All Appointments</h3>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center text-brand-500/70 text-sm">
                  No appointments in the system yet
                </div>
              ) : (
                appointments.map((appt) => (
                  <div key={appt._id} className="bg-white rounded-2xl border border-brand-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <button
                          onClick={() => viewPatientHistory(appt.patient._id, appt.patient.name)}
                          className="font-medium text-brand-900 hover:text-brand-600 transition-colors"
                        >
                          {appt.patient?.name}
                        </button>
                        <p className="text-sm text-brand-500/70">with Dr. {appt.doctor?.name}</p>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>
                    <p className="text-sm text-brand-500/70">
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
          <div className="bg-white rounded-2xl border border-brand-100 p-6 animate-rise">
            <h2 className="text-base font-semibold text-brand-900 mb-1">Add Doctor</h2>
            <p className="text-sm text-brand-500/70 mb-5">Create a new doctor account for the system</p>

            {message && (
              <div className="bg-brand-50 border border-brand-200 text-brand-700 text-sm rounded-lg px-3 py-2 mb-4">
                {message}
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Full Name</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Email</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">Temporary Password</label>
                <input
                  type="password" name="password" value={formData.password} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-br from-brand-600 to-brand-800 hover:shadow-lg hover:-translate-y-0.5 text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
              >
                Create Doctor Account
              </button>
            </form>
          </div>

          

          <div>
            <h3 className="text-sm font-semibold text-brand-500/70 uppercase tracking-wide mb-3">
              All Doctors ({doctors.length})
            </h3>
            <div className="bg-white rounded-2xl border border-brand-100 divide-y divide-brand-100">
              {doctors.map((doc) => (
                <div key={doc._id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center text-sm font-medium">
                    {doc.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900">{doc.name}</p>
                    <p className="text-xs text-brand-500/70">{doc.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
      <div className="bg-white rounded-2xl border border-brand-100 p-6 animate-rise">
  <h2 className="text-base font-semibold text-brand-900 mb-1">
    Create Admin
  </h2>

  <p className="text-sm text-brand-500/70 mb-5">
    Create another administrator account
  </p>

  {adminMessage && (
    <div className="bg-brand-50 border border-brand-200 text-brand-700 text-sm rounded-lg px-3 py-2 mb-4">
      {adminMessage}
    </div>
  )}

  <form onSubmit={handleCreateAdmin} className="space-y-4">

    <div>
      <label className="block text-sm font-medium text-brand-700 mb-1">
        Full Name
      </label>

      <input
        type="text"
        name="name"
        value={adminForm.name}
        onChange={handleAdminChange}
        required
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-brand-700 mb-1">
        Email
      </label>

      <input
        type="email"
        name="email"
        value={adminForm.email}
        onChange={handleAdminChange}
        required
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-brand-700 mb-1">
        Temporary Password
      </label>

      <input
        type="password"
        name="password"
        value={adminForm.password}
        onChange={handleAdminChange}
        required
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
      />
    </div>

    <button
      type="submit"
      className="w-full bg-gradient-to-br from-brand-600 to-brand-800 hover:shadow-lg hover:-translate-y-0.5 text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
    >
      Create Admin Account
    </button>

  </form>
</div>
      )}

      {historyPatientId && (
        <div className="fixed inset-0 bg-brand-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-brand-100 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-rise">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-brand-900">History — {historyPatientName}</h3>
              <button onClick={closeHistory} className="text-brand-400 hover:text-brand-600">✕</button>
            </div>

            {patientHistory.length === 0 ? (
              <p className="text-sm text-brand-500/70">No past visits with this patient</p>
            ) : (
              <div className="space-y-3">
                {patientHistory.map((visit) => (
                  <div key={visit._id} className="border border-brand-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-brand-900">
                        {new Date(visit.date).toLocaleDateString()}
                      </span>
                      <StatusBadge status={visit.status} />
                    </div>
                    <p className="text-sm text-brand-500/70 mb-1">{visit.reason}</p>
                    {visit.prescription && (
                      <p className="text-sm text-brand-700 bg-brand-50 rounded p-2 mt-1">{visit.prescription}</p>
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
