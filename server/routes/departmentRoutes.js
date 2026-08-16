const express = require('express');
const Department = require('../models/Department');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Any logged-in user can view departments — patients need this for the booking flow
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin creates a new department
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'A department with this name already exists' });
    }

    const department = await Department.create({
      name: name.trim(),
      icon: icon || 'Stethoscope'
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin deletes a department — blocked if doctors are still assigned to it
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const doctorsInDept = await User.countDocuments({
      department: req.params.id,
      role: 'doctor'
    });

    if (doctorsInDept > 0) {
      return res.status(400).json({
        message: `Cannot delete — ${doctorsInDept} doctor(s) are still assigned to this department. Reassign or remove them first.`
      });
    }

    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json({ message: 'Department removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
