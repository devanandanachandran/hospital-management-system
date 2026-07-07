const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
     availableFrom: { type: String, default: '09:00' },
  availableTo: { type: String, default: '17:00' },
  slotDuration: { type: Number, default: 30 }
}, { timestamps: true });



module.exports = mongoose.model('User', userSchema);