const mongoose = require('mongoose');



const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  prescription: {
    type: String,
    default: ''
  }
}, { timestamps: true });

appointmentSchema.index({ doctor: 1, date: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } });

module.exports = mongoose.model('Appointment', appointmentSchema);