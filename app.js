require('express-async-errors');
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');

const connectDB        = require('./config/db');
const errorHandler     = require('./middleware/errorHandler');
const {notFound}       = require('./middleware/notFound');
const authRoutes       = require('./routes/authRoutes');
const studentRoutes    = require('./routes/studentRoutes');
const teacherRoutes    = require('./routes/teacherRoutes');
const classRoutes      = require('./routes/classRoutes');
const subjectRoutes    = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes       = require('./routes/examRoutes');
const resultRoutes     = require('./routes/resultRoutes');
const feeRoutes        = require('./routes/feeRoutes');
const noticeRoutes     = require('./routes/noticeRoutes');
const smsRoutes        = require('./routes/smsRoutes');
const timetableRoutes  = require('./routes/timetableRoutes');
const libraryRoutes    = require('./routes/libraryRoutes');
const transportRoutes  = require('./routes/transportRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');

const app = express();
connectDB();
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  'https://edu-manage-eta.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)){
      return callback(null,true);
    }
    return callback(new Error('CORS blocked:' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.options('*', cors());

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined':'dev'));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true,limit:'10mb'}));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

app.get('/api/health',(req,res)=>{
  res.json({
    status: 'OK',
    message: 'School Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

const API = '/api/v1';
app.use(`${API}/auth`,authRoutes);
app.use(`${API}/dashboard`,dashboardRoutes);
app.use(`${API}/students`,studentRoutes);
app.use(`${API}/teachers`,teacherRoutes);
app.use(`${API}/classes`,classRoutes);
app.use(`${API}/subjects`,subjectRoutes);
app.use(`${API}/attendance`,attendanceRoutes);
app.use(`${API}/exams`,examRoutes);
app.use(`${API}/results`,resultRoutes);
app.use(`${API}/fees`,feeRoutes);
app.use(`${API}/notices`,noticeRoutes);
app.use(`${API}/sms`,smsRoutes);
app.use(`${API}/timetable`,timetableRoutes);
app.use(`${API}/library`,libraryRoutes);
app.use(`${API}/transport`,transportRoutes);

app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}\n`);
});
module.exports = app;