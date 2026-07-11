const express = require('express');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// Get available slots for a doctor on a specific date
router.get('/available-slots/:doctorId', protect, async (req, res) => {
  try {
    const { date } = req.query; // expects YYYY-MM-DD
    const doctor = await User.findById(req.params.doctorId);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Generate all possible slots between availableFrom and availableTo
    const slots = [];
    const [startHour, startMin] = doctor.availableFrom.split(':').map(Number);
    const [endHour, endMin] = doctor.availableTo.split(':').map(Number);

    let current = new Date(`${date}T00:00:00`);
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date(`${date}T00:00:00`);
    end.setHours(endHour, endMin, 0, 0);

    while (current < end) {
      slots.push(new Date(current));
      current.setMinutes(current.getMinutes() + doctor.slotDuration);
    }

    // Find already booked slots for this doctor on this date (excluding cancelled)
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const bookedAppointments = await Appointment.find({
      doctor: req.params.doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const bookedTimes = bookedAppointments.map(appt => appt.date.getTime());

    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot.getTime()));

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctor, date, reason } = req.body;

    // Double-check this exact slot isn't already booked (race condition safety)
    const existing = await Appointment.findOne({
      doctor,
      date,
      status: { $ne: 'cancelled' }
    });

    if (existing) {
      return res.status(400).json({ message: 'This slot has just been booked by someone else. Please choose another.' });
    }

    const appointment = await Appointment.create({
      patient: req.user.userId,
      doctor,
      date,
      reason
    });

    res.status(201).json(appointment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This slot is no longer available' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Patient views their own appointments
router.get('/my-appointments', protect, authorize('patient'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.userId })
      .populate('doctor', 'name email');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Doctor views today's/their appointments
router.get('/doctor-appointments', protect, authorize('doctor'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user.userId })
      .populate('patient', 'name email');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin views all appointments
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Doctor updates an appointment (add prescription, change status)
router.put('/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const { prescription, status } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Make sure this doctor owns this appointment
    if (appointment.doctor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this appointment' });
    }

    appointment.prescription = prescription ?? appointment.prescription;
    appointment.status = status ?? appointment.status;

    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Patient cancels their own appointment
router.put('/:id/cancel', protect, authorize('patient'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Make sure this patient owns this appointment
    if (appointment.patient.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel a completed appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;