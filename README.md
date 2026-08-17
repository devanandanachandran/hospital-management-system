# Hospital Management System

A full-stack Hospital Management System built using React, Node.js, Express and MongoDB.

## Features

- User authentication with role-based access
- Patient, Doctor and Admin dashboards
- Doctor appointment booking
- Doctor availability and time slot management
- Appointment search and filtering
- Patient appointment history
- Doctor patient history
- Prescription management
- Prescription PDF download
- Medical report sharing
- Admin doctor management
- Admin account management
- Department management
- Department-based doctor browsing
- Appointment cancellation
- Toast notifications

## Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```text
hospital-management-system/
│
├── client/
│   └── src/
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── .gitignore
└── README.md

```

## Installation

Clone the repository and install the dependencies.

### Frontend
cd client
npm install
npm run dev

### Backend
Open another terminal:
cd server
npm install
npm run dev

## Environment Variables
Create a .env file inside the server folder and add:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

## User Roles

## Patient
Patients can:

Browse doctors and departments
Search for doctors
Book appointments
View available time slots
View appointment history
Cancel appointments
View prescriptions
Download prescription PDFs
View medical reports

## Doctor
Doctors can:

View assigned appointments
View patient information
View patient history
Update appointment status
Add prescriptions
Upload medical reports

## Admin
Admins can:

View all appointments
Create doctor accounts
Remove doctors
Create administrator accounts
Create and manage departments
Assign departments to doctors

## Database
The application uses MongoDB for storing:
Users
Appointments
Departments
Prescriptions
Medical report information
Authentication

Authentication is implemented using JSON Web Tokens (JWT), with role-based authorization for patients, doctors and administrators.
