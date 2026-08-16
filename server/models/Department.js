const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Key into the frontend's DEPARTMENT_ICONS map (see client/src/utils/departmentIcons.js)
  icon: {
    type: String,
    default: 'Stethoscope'
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
