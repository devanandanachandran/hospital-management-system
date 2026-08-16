import { useState, useEffect } from 'react';
import { Calendar, Users, Upload ,Clock} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import API from '../api/axios';
import { uploadToCloudinary } from '../utils/uploadFile';
import { generatePrescriptionPDF } from '../utils/generatePrescriptionPDF';
import { Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';


function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [appointments, setAppointments] = useState([]);
  const [apptSearch, setApptSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [historyPatientId, setHistoryPatientId] = useState(null);
  const [historyPatientName, setHistoryPatientName] = useState('');
  const [patientHistory, setPatientHistory] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const { showToast } = useToast();

  const navItems = [
    { key: 'schedule', label: 'My Schedule', icon: Calendar },
    { key: 'availability', label: 'Availability', icon: Clock },
  ];

  const [availability, setAvailability] = useState({
  availableFrom: '09:00',
  availableTo: '17:00',
  slotDuration: 30
});
const [availMessage, setAvailMessage] = useState('');
const [availLoading, setAvailLoading] = useState(false);

const handleAvailabilityChange = (e) => {
  setAvailability({ ...availability, [e.target.name]: e.target.value });
};

const handleSaveAvailability = async (e) => {
  e.preventDefault();
  setAvailLoading(true);
  setAvailMessage('');
  try {
    await API.put('/auth/availability', availability);
    setAvailMessage('Availability updated successfully');
  } catch (err) {
    setAvailMessage(err.response?.data?.message || 'Something went wrong');
  } finally {
    setAvailLoading(false);
  }
};

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

    showToast('Prescription saved successfully');

    setEditingId(null);
    setPrescription('');
    fetchAppointments();
  } catch (err) {
    console.error(err);

    showToast(
      err.response?.data?.message || 'Something went wrong',
      'error'
    );
  }
};

     const handleConfirm = async (id) => {
  try {
    await API.put(`/appointments/${id}`, {
      status: 'confirmed'
    });

    showToast('Appointment confirmed');
    fetchAppointments();
  } catch (err) {
    console.error(err);
    showToast(
      err.response?.data?.message || 'Something went wrong',
      'error'
    );
  }
};

  

  const groupByDate = (appts) => {
    const groups = {};

    appts.forEach((appt) => {
      const dateKey = new Date(appt.date).toLocaleDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(appt);
    });

    return groups;
  };

     const filteredAppointments = appointments.filter((appt) =>
  appt.patient?.name
    ?.toLowerCase()
    .includes(apptSearch.toLowerCase())
);

const groupedAppointments = groupByDate(
  filteredAppointments
    .filter((a) => a.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
);

  const pendingCount = appointments.filter(
    (a) => a.status === 'pending'
  ).length;

  const completedCount = appointments.filter(
    (a) => a.status === 'completed'
  ).length;

  // Upload medical report
  const handleFileUpload = async (e, appointmentId) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploadingId(appointmentId);

    try {
      const { url, name } = await uploadToCloudinary(file);

      await API.put(`/appointments/${appointmentId}/report`, {
        reportUrl: url,
        reportName: name
      });

      fetchAppointments();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingId(null);
    }
  };

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

          {/* Dashboard Stats */}
          <div className="grid grid-cols-3 gap-4">

            <div className="bg-white rounded-[14px] border border-brand-100 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <p className="text-xs font-medium text-brand-500/70 mb-1">
                Upcoming
              </p>

              <p className="text-2xl font-bold text-brand-700">
                {
                  appointments.filter(
                    (a) =>
                      a.status !== 'cancelled' &&
                      a.status !== 'completed'
                  ).length
                }
              </p>
            </div>

            <div className="bg-white rounded-[14px] border border-brand-100 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <p className="text-xs font-medium text-brand-500/70 mb-1">
                Pending Confirmation
              </p>

              <p className="text-2xl font-bold text-accent-600">
                {pendingCount}
              </p>
            </div>

            <div className="bg-white rounded-[14px] border border-brand-100 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
              <p className="text-xs font-medium text-brand-500/70 mb-1">
                Completed
              </p>

              <p className="text-2xl font-bold text-emerald-600">
                {completedCount}
              </p>
            </div>

          </div>

          <h3 className="text-base font-semibold text-brand-900">
            My Schedule
          </h3>

          <SearchInput
  value={apptSearch}
  onChange={(e) => setApptSearch(e.target.value)}
  placeholder="Search by patient name..."
/>

          {/* Patient History Modal */}
          {historyPatientId && (
            <div className="fixed inset-0 bg-brand-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">

              <div className="bg-white rounded-2xl border border-brand-100 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-rise">

                <div className="flex items-center justify-between mb-4">

                  <h3 className="text-base font-semibold text-brand-900">
                    History — {historyPatientName}
                  </h3>

                  <button
                    onClick={closeHistory}
                    className="text-brand-400 hover:text-brand-600"
                  >
                    ✕
                  </button>

                </div>

                {patientHistory.length === 0 ? (

                  <p className="text-sm text-brand-500/70">
                    No past visits with this patient
                  </p>

                ) : (

                  <div className="space-y-3">

                    {patientHistory.map((visit) => (

                      <div
                        key={visit._id}
                        className="border border-brand-100 rounded-lg p-3"
                      >

                        <div className="flex items-center justify-between mb-1">

                          <span className="text-sm font-medium text-brand-900">
                            {new Date(
                              visit.date
                            ).toLocaleDateString()}
                          </span>

                          <StatusBadge status={visit.status} />

                        </div>

                        <p className="text-sm text-brand-500/70 mb-1">
                          {visit.reason}
                        </p>

                        {visit.prescription && (
                          <p className="text-sm text-brand-700 bg-brand-50 rounded p-2 mt-1">
                            {visit.prescription}
                          </p>
                        )}

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>
          )}

          {/* Appointments */}
          {Object.keys(groupedAppointments).length === 0 ? (

            <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center text-brand-500/70 text-sm">
              No upcoming appointments
            </div>

          ) : (

            Object.entries(groupedAppointments).map(
              ([date, appts]) => (

                <div key={date}>

                  <h3 className="text-sm font-semibold text-brand-500/70 uppercase tracking-wide mb-3">
                    {date}
                  </h3>

                  <div className="space-y-3">

                    {appts.map((appt) => (

                      <div
                        key={appt._id}
                        className="bg-white rounded-2xl border border-brand-100 p-5 hover:shadow-md transition-shadow"
                      >

                        {/* Patient + Status */}
                        <div className="flex items-start justify-between mb-3">

                          <div>

                            <button
                              onClick={() =>
                                viewPatientHistory(
                                  appt.patient._id,
                                  appt.patient.name
                                )
                              }
                              className="font-medium text-brand-900 hover:text-brand-600 transition-colors"
                            >
                              {appt.patient?.name}
                            </button>

                            <p className="text-sm text-brand-500/70">
                              {appt.reason}
                            </p>

                          </div>

                          <StatusBadge status={appt.status} />

                        </div>

                        {/* Appointment Time */}
                        <p className="text-sm text-brand-500/70 mb-4">
                          {new Date(
                            appt.date
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>

                        {/* Buttons */}
                        <div className="flex items-center gap-3">

                          {/* Confirm */}
                          {appt.status === 'pending' && (

                            <button
                              onClick={() =>
                                handleConfirm(appt._id)
                              }
                              className="text-sm bg-gradient-to-br from-brand-600 to-brand-800 hover:shadow-md text-white font-medium px-3 py-1.5 rounded-lg transition-all"
                            >
                              Confirm
                            </button>

                          )}

                          {/* Prescription */}
                          {editingId !== appt._id && (

                            <button
                              onClick={() =>
                                startEditing(appt)
                              }
                              className="text-sm text-brand-600 hover:text-brand-900 font-medium"
                            >
                              {appt.prescription
                                ? 'Edit Prescription'
                                : 'Add Prescription'}
                            </button>

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

                        </div>

                        {/* Upload Medical Report */}
                        <div className="mt-3">

                          <label className="text-sm text-slate-600 font-medium cursor-pointer flex items-center gap-1.5 hover:text-blue-600 transition-colors">

                            <Upload size={14} />

                            {uploadingId === appt._id
                              ? 'Uploading...'
                              : (appt.reportName || 'Attach Report')}

                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                handleFileUpload(
                                  e,
                                  appt._id
                                )
                              }
                              className="hidden"
                            />

                          </label>

                        </div>

                        {/* Prescription Editor */}
                        {editingId === appt._id && (

                          <div className="mt-4 pt-4 border-t border-brand-100">

                            <textarea
                              value={prescription}
                              onChange={(e) =>
                                setPrescription(e.target.value)
                              }
                              placeholder="Write prescription..."
                              rows={3}
                              className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 mb-3 transition-all"
                            />

                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  handleSavePrescription(
                                    appt._id
                                  )
                                }
                                className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Save & Mark Completed
                              </button>

                              <button
                                onClick={() =>
                                  setEditingId(null)
                                }
                                className="text-sm text-brand-500/70 hover:text-brand-700 font-medium px-3 py-1.5"
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

              )
            )

          )}

        </div>
      )}

      {activeTab === 'availability' && (
  <div className="max-w-md">
    <div className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-[20px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-8">
      <div className="w-11 h-11 rounded-[13px] bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center mb-4">
        <Clock className="text-white" size={22} />
      </div>
      <h2 className="text-xl font-semibold text-brand-900">Set Your Availability</h2>
      <p className="text-brand-500/80 text-sm mt-1 mb-6">
        Patients will only be able to book within these hours
      </p>

      {availMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-3 py-2 mb-4">
          {availMessage}
        </div>
      )}

      <form onSubmit={handleSaveAvailability} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-brand-700/80 mb-1.5 tracking-wide">
            Available From
          </label>
          <input
            type="time"
            name="availableFrom"
            value={availability.availableFrom}
            onChange={handleAvailabilityChange}
            required
            className="w-full px-3.5 py-2.5 border border-brand-200 rounded-[10px] text-sm bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-700/80 mb-1.5 tracking-wide">
            Available Until
          </label>
          <input
            type="time"
            name="availableTo"
            value={availability.availableTo}
            onChange={handleAvailabilityChange}
            required
            className="w-full px-3.5 py-2.5 border border-brand-200 rounded-[10px] text-sm bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-700/80 mb-1.5 tracking-wide">
            Slot Duration (minutes)
          </label>
          <select
            name="slotDuration"
            value={availability.slotDuration}
            onChange={handleAvailabilityChange}
            className="w-full px-3.5 py-2.5 border border-brand-200 rounded-[10px] text-sm bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
          >
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={availLoading}
          className="w-full bg-gradient-to-br from-brand-600 to-brand-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 text-white text-sm font-semibold py-3 rounded-[10px] transition-all shadow-[0_8px_20px_-8px_rgba(17,86,90,0.6)]"
        >
          {availLoading ? 'Saving...' : 'Save Availability'}
        </button>
      </form>
    </div>
  </div>
)}

    </DashboardLayout>
  );
}

export default DoctorDashboard;