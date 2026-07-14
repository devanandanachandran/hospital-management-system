const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Workaround for DNS SRV lookup issue on this machine.
// Forces Node.js to use Google and Cloudflare DNS servers.

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const app = express();

app.use(cors({
  origin: 'https://hospital-management-system-two-phi.vercel.app/',
  credentials: true
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.get('/', (req, res) => {
  res.send('Hospital Management System API is running');
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});