require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User      = require('../models/User');
const Class     = require('../models/Class');
const Subject   = require('../models/Subject');
const Teacher   = require('../models/Teacher');
const Student   = require('../models/Student');
const Notice    = require('../models/Notice');
const Transport = require('../models/Transport');
const Book      = require('../models/Book');

const connectDB = require('../config/db');

const seed = async () => {
  await connectDB();
  console.log(' Starting database seed...\n');

  await Promise.all([
    User.deleteMany(), Class.deleteMany(), Subject.deleteMany(),
    Teacher.deleteMany(), Student.deleteMany(), Notice.deleteMany(),
    Transport.deleteMany(), Book.deleteMany(),
  ]);
  console.log('🗑  Cleared existing data');
  const admin = await User.create({
    name: 'Admin User', email: 'admin@school.edu',
    password: 'admin123', role: 'admin',
  });
  console.log('👤 Admin created: admin@school.edu / admin123');

  const subjects = await Subject.insertMany([
    { name: 'Mathematics',    code: 'MATH',  fullMarks: 100, passMarks: 33 },
    { name: 'Science',        code: 'SCI',   fullMarks: 100, passMarks: 33 },
    { name: 'English',        code: 'ENG',   fullMarks: 100, passMarks: 33 },
    { name: 'Hindi',          code: 'HIN',   fullMarks: 100, passMarks: 33 },
    { name: 'Social Studies', code: 'SST',   fullMarks: 100, passMarks: 33 },
    { name: 'Computer Sc.',   code: 'COMP',  fullMarks: 100, passMarks: 33 },
    { name: 'Physical Edu.',  code: 'PE',    fullMarks: 50,  passMarks: 17 },
  ]);
  console.log(`📚 ${subjects.length} subjects created`);

  const classData = [
    { name: '10', section: 'A', roomNumber: '101', maxStudents: 45 },
    { name: '10', section: 'B', roomNumber: '102', maxStudents: 45 },
    { name: '9',  section: 'A', roomNumber: '201', maxStudents: 40 },
    { name: '9',  section: 'B', roomNumber: '202', maxStudents: 40 },
    { name: '8',  section: 'A', roomNumber: '301', maxStudents: 40 },
    { name: '8',  section: 'B', roomNumber: '302', maxStudents: 40 },
    { name: '7',  section: 'A', roomNumber: '401', maxStudents: 38 },
    { name: '7',  section: 'B', roomNumber: '402', maxStudents: 38 },
  ];

  const allSubjectIds = subjects.map(s => s._id);
  const classes = await Class.insertMany(
    classData.map(c => ({ ...c, subjects: allSubjectIds, session: '2024-25' }))
  );
  console.log(`🏫 ${classes.length} classes created`);

  const teacherDocs = [
    { name: 'Mrs. Sunita Rao',    email: 'sunita@school.edu',  phone: '9811111111', qualification: 'M.Sc. Math',     experience: '12 yrs', designation: 'Senior Teacher' },
    { name: 'Mr. Deepak Tiwari',  email: 'deepak@school.edu',  phone: '9811111112', qualification: 'M.Sc. Physics',   experience: '8 yrs',  designation: 'Teacher' },
    { name: 'Mrs. Pooja Agarwal', email: 'pooja@school.edu',   phone: '9811111113', qualification: 'M.A. English',   experience: '10 yrs', designation: 'Senior Teacher' },
    { name: 'Mr. Ravi Kumar',     email: 'ravi@school.edu',    phone: '9811111114', qualification: 'M.A. History',   experience: '6 yrs',  designation: 'Teacher' },
    { name: 'Mrs. Anita Sharma',  email: 'anita@school.edu',   phone: '9811111115', qualification: 'M.A. Hindi',     experience: '15 yrs', designation: 'HOD' },
    { name: 'Mr. Sanjay Mishra',  email: 'sanjay@school.edu',  phone: '9811111116', qualification: 'MCA',             experience: '9 yrs',  designation: 'Teacher' },
  ];

  const teachers = await Teacher.insertMany(teacherDocs);
  console.log(`👩‍🏫 ${teachers.length} teachers created`);

  for (const t of teachers){
    const user = await User.create({
      name:t.name,email:t.email,password:'teacher123',role:'teacher', teacherProfile: t._id,
    });
    await Teacher.findByIdAndUpdate(t._id, { user: user._id });
  }
  console.log('🔑 Teacher login accounts created (password: teacher123)');

  const studentData = [
    { name: 'Aarav Sharma',  rollNumber: '10A-001', dateOfBirth: new Date('2009-03-12'), gender: 'Male',   class: classes[0]._id, guardian: { name: 'Rajesh Sharma',  relation: 'Father', phone: '9876543210', email: 'rajesh@gmail.com' } },
    { name: 'Priya Patel',   rollNumber: '10A-002', dateOfBirth: new Date('2009-07-22'), gender: 'Female', class: classes[0]._id, guardian: { name: 'Sunil Patel',    relation: 'Father', phone: '9876543211', email: 'sunil@gmail.com'  } },
    { name: 'Rohan Gupta',   rollNumber: '10B-001', dateOfBirth: new Date('2008-11-05'), gender: 'Male',   class: classes[1]._id, guardian: { name: 'Mohan Gupta',    relation: 'Father', phone: '9876543212', email: 'mohan@gmail.com'  } },
    { name: 'Sneha Verma',   rollNumber: '9A-001',  dateOfBirth: new Date('2010-01-18'), gender: 'Female', class: classes[2]._id, guardian: { name: 'Kavita Verma',   relation: 'Mother', phone: '9876543213', email: 'kavita@gmail.com' } },
    { name: 'Arjun Singh',   rollNumber: '9A-002',  dateOfBirth: new Date('2010-04-30'), gender: 'Male',   class: classes[2]._id, guardian: { name: 'Harpreet Singh', relation: 'Father', phone: '9876543214', email: 'harpr@gmail.com'  } },
    { name: 'Diya Mehta',    rollNumber: '8A-001',  dateOfBirth: new Date('2011-09-14'), gender: 'Female', class: classes[4]._id, guardian: { name: 'Nitin Mehta',    relation: 'Father', phone: '9876543215', email: 'nitin@gmail.com'  } },
    { name: 'Kabir Khan',    rollNumber: '8B-001',  dateOfBirth: new Date('2011-06-25'), gender: 'Male',   class: classes[5]._id, guardian: { name: 'Salim Khan',     relation: 'Father', phone: '9876543216', email: 'salim@gmail.com'  } },
    { name: 'Ananya Joshi',  rollNumber: '7A-001',  dateOfBirth: new Date('2012-02-08'), gender: 'Female', class: classes[6]._id, guardian: { name: 'Prakash Joshi',  relation: 'Father', phone: '9876543217', email: 'praka@gmail.com'  } },
  ];

  const students = await Student.insertMany(
    studentData.map(s => ({ ...s, session: '2024-25', admissionDate: new Date(), feeStatus: 'pending', status: 'active' }))
  );
  console.log(`🎓 ${students.length} students created`);

  await Notice.insertMany([
    { title: 'Annual Sports Day',      content: 'Annual Sports Day will be held on 28th January. All students must participate in at least one event.', priority: 'high',   targetType: 'all',    publishedBy: admin._id, smsSent: true,  smsCount: 8 },
    { title: 'Fee Submission Deadline',content: 'Last date for Q3 fee submission is 25th January. Penalty charges apply after deadline.',              priority: 'urgent', targetType: 'all',    publishedBy: admin._id, smsSent: true,  smsCount: 8 },
    { title: 'PTM – Class 10',         content: 'Parent-Teacher Meeting for Class 10 on 22nd January at 10 AM in the school auditorium.',              priority: 'medium', targetType: 'class',  publishedBy: admin._id, smsSent: false },
    { title: 'Republic Day Holiday',   content: 'School will remain closed on 26th January on account of Republic Day.',                               priority: 'low',    targetType: 'all',    publishedBy: admin._id, smsSent: false },
  ]);
  console.log('📢 Notices created');

  await Transport.insertMany([
    { routeName: 'Route 1 – North Zone', busNumber: 'DL1C1234', busCapacity: 40, driver: { name: 'Ramesh Kumar', phone: '9811000001', license: 'DL-1234567890' }, stops: [{ name: 'Pitampura' }, { name: 'Rohini' }, { name: 'Shalimar Bagh' }], monthlyFee: 1500, status: 'active' },
    { routeName: 'Route 2 – South Zone', busNumber: 'DL1C5678', busCapacity: 40, driver: { name: 'Suresh Singh',  phone: '9811000002', license: 'DL-0987654321' }, stops: [{ name: 'Saket' },    { name: 'Malviya Nagar' }, { name: 'Hauz Khas' }],    monthlyFee: 1500, status: 'active' },
    { routeName: 'Route 3 – East Zone',  busNumber: 'DL1C9012', busCapacity: 35, driver: { name: 'Prakash Yadav', phone: '9811000003', license: 'DL-1122334455' }, stops: [{ name: 'Laxmi Nagar' }, { name: 'Mayur Vihar' }, { name: 'Patparganj' }],  monthlyFee: 1500, status: 'maintenance' },
  ]);
  console.log('🚌 Transport routes created');

  await Book.insertMany([
    { title: 'Mathematics – Class 10',   author: 'NCERT',              isbn: '978-81-7450-001-1', category: 'textbook',      totalCopies: 10, availableCopies: 8, shelfNumber: 'A-1' },
    { title: 'Science – Class 9',        author: 'NCERT',              isbn: '978-81-7450-002-2', category: 'textbook',      totalCopies: 10, availableCopies: 5, shelfNumber: 'A-2' },
    { title: 'Wings of Fire',            author: 'A.P.J. Abdul Kalam', isbn: '978-81-7371-146-3', category: 'autobiography', totalCopies: 5,  availableCopies: 2, shelfNumber: 'B-1' },
    { title: 'The Jungle Book',          author: 'Rudyard Kipling',    isbn: '978-0-14-062382-3', category: 'fiction',       totalCopies: 3,  availableCopies: 0, shelfNumber: 'C-1', status: 'all-issued' },
    { title: 'India: A History',         author: 'John Keay',          isbn: '978-0-8021-3797-5', category: 'reference',     totalCopies: 4,  availableCopies: 3, shelfNumber: 'D-1' },
  ]);

  console.log('📖 Library books created');
  console.log('\n✅ Database seeded successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log('  LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════');
  console.log('  Admin   → admin@school.edu   / admin123');
  console.log('  Teacher → sunita@school.edu  / teacher123');
  console.log('  Teacher → deepak@school.edu  / teacher123');
  console.log('═══════════════════════════════════════\n');

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
