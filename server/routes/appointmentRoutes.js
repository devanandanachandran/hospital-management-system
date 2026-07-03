const express = require('express');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Patient books an appointment
router.post('/', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctor, date, reason } = req.body;

    const appointment = await Appointment.create({
      patient: req.user.userId,
      doctor,
      date,
      reason
    });

    res.status(201).json(appointment);
  } catch (error) {
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

module.exports = router;