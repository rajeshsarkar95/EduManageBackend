# 🏫 School Management System — Backend API

**Node.js + Express.js + MongoDB**  
Full REST API for the School Management System with JWT auth, SMS integration, and file uploads.

---

## 📁 Folder Structure

```
school-backend/
├── server.js                    # Entry point
├── .env.example                 # Environment variables template
├── package.json
│
├── config/
│   ├── db.js                    # MongoDB connection
│   └── constants.js             # App-wide constants & enums
│
├── models/                      # Mongoose schemas
│   ├── User.js                  # Admin & Teacher accounts
│   ├── Student.js               # Student profiles
│   ├── Teacher.js               # Teacher profiles
│   ├── Class.js                 # Class sections
│   ├── Subject.js               # Subjects
│   ├── Attendance.js            # Daily attendance records
│   ├── Exam.js                  # Exam schedules
│   ├── Result.js                # Student exam results
│   ├── Fee.js                   # Fee records & payments
│   ├── Notice.js                # School notices
│   ├── SmsLog.js                # SMS delivery logs
│   ├── Timetable.js             # Weekly timetables
│   ├── Book.js                  # Library books & issue history
│   └── Transport.js             # Bus routes & drivers
│
├── controllers/                 # Business logic
│   ├── authController.js        # Login, register, JWT
│   ├── dashboardController.js   # Dashboard stats
│   ├── studentController.js     # Student CRUD
│   ├── teacherController.js     # Teacher CRUD
│   ├── classController.js       # Class CRUD
│   ├── subjectController.js     # Subject CRUD
│   ├── attendanceController.js  # Mark attendance + SMS
│   ├── examController.js        # Exam scheduling
│   ├── resultController.js      # Results entry & reports
│   ├── feeController.js         # Fee tracking & payments
│   ├── noticeController.js      # Notices + SMS broadcast
│   ├── smsController.js         # Manual SMS & logs
│   └── otherControllers.js      # Timetable, Library, Transport
│
├── routes/                      # Express routers
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── studentRoutes.js
│   ├── teacherRoutes.js
│   ├── classRoutes.js
│   ├── subjectRoutes.js
│   ├── attendanceRoutes.js
│   ├── examRoutes.js
│   ├── resultRoutes.js
│   ├── feeRoutes.js
│   ├── noticeRoutes.js
│   ├── smsRoutes.js
│   ├── timetableRoutes.js
│   ├── libraryRoutes.js
│   └── transportRoutes.js
│
├── middleware/
│   ├── auth.js                  # JWT protect + role authorize
│   ├── errorHandler.js          # Global error handler
│   ├── notFound.js              # 404 handler
│   ├── upload.js                # Multer file uploads
│   └── validate.js              # express-validator helper
│
├── utils/
│   ├── smsService.js            # Fast2SMS / Textlocal integration
│   ├── helpers.js               # Pagination, formatting, etc.
│   └── seeder.js                # DB seed script
│
└── uploads/                     # Uploaded files (auto-created)
    ├── photos/
    ├── documents/
    └── attachments/
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# SMS (Fast2SMS)
FAST2SMS_API_KEY=your_api_key
FAST2SMS_SENDER_ID=SCHOOL
SMS_PROVIDER=fast2sms

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 3. Seed the Database
```bash
npm run seed
```
This creates sample data including:
- Admin account: `admin@school.edu` / `admin123`
- Teacher accounts: `sunita@school.edu` / `teacher123`
- 8 classes, 6 teachers, 8 students, notices, books, routes

### 4. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login (Admin/Teacher) |
| POST | `/api/v1/auth/register` | Register user |
| GET  | `/api/v1/auth/me` | Get current user |
| PUT  | `/api/v1/auth/change-password` | Change password |
| GET  | `/api/v1/auth/users` | All users (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Summary stats |
| GET | `/api/v1/dashboard/recent-activity` | Recent activity |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/students` | List students (search, filter) |
| POST   | `/api/v1/students` | Create student |
| GET    | `/api/v1/students/:id` | Get student |
| PUT    | `/api/v1/students/:id` | Update student |
| DELETE | `/api/v1/students/:id` | Delete student |
| GET    | `/api/v1/students/class/:classId` | Students by class |
| GET    | `/api/v1/students/stats` | Student statistics |

### Teachers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/teachers` | List teachers |
| POST   | `/api/v1/teachers` | Create teacher |
| GET    | `/api/v1/teachers/:id` | Get teacher |
| PUT    | `/api/v1/teachers/:id` | Update teacher |
| DELETE | `/api/v1/teachers/:id` | Delete teacher |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/attendance` | Mark attendance (sends SMS for absent) |
| GET  | `/api/v1/attendance` | Get attendance records |
| GET  | `/api/v1/attendance/student/:id` | Student attendance history |
| GET  | `/api/v1/attendance/report` | Monthly report |

### Fees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/v1/fees` | List fee records |
| POST | `/api/v1/fees` | Create fee record |
| GET  | `/api/v1/fees/:id` | Get fee details |
| POST | `/api/v1/fees/:id/pay` | Record a payment |
| GET  | `/api/v1/fees/stats` | Fee statistics |
| POST | `/api/v1/fees/send-reminders` | Bulk SMS reminders |

### SMS
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sms/send` | Send manual SMS |
| GET  | `/api/v1/sms/logs` | View SMS logs |
| GET  | `/api/v1/sms/stats` | SMS statistics |

### Notices
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/notices` | List notices |
| POST   | `/api/v1/notices` | Create notice (with optional SMS) |
| PUT    | `/api/v1/notices/:id` | Update notice |
| DELETE | `/api/v1/notices/:id` | Delete notice |

### Exams & Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/exams` | List exams |
| POST   | `/api/v1/exams` | Schedule exam |
| GET    | `/api/v1/results` | List results |
| POST   | `/api/v1/results` | Add result |
| POST   | `/api/v1/results/bulk` | Bulk add results |
| GET    | `/api/v1/results/student/:id` | Student report card |

### Library
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/library` | List books |
| POST   | `/api/v1/library` | Add book |
| POST   | `/api/v1/library/:id/issue` | Issue book |
| POST   | `/api/v1/library/:id/return` | Return book |

### Transport
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/v1/transport` | List routes |
| POST   | `/api/v1/transport` | Add route |
| PUT    | `/api/v1/transport/:id` | Update route |
| POST   | `/api/v1/transport/:id/assign-student` | Assign student |

---

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

**Roles:**
- `admin` — Full access to all endpoints
- `teacher` — Read access + mark attendance for own classes

---

## 📱 SMS Integration

### Fast2SMS Setup
1. Register at [fast2sms.com](https://fast2sms.com)
2. Get your API key from the dashboard
3. Complete DLT registration (required for Indian SMS)
4. Add to `.env`: `FAST2SMS_API_KEY=your_key`

### Textlocal Setup
1. Register at [textlocal.in](https://textlocal.in)
2. Get API key from API section
3. Add to `.env`: `TEXTLOCAL_API_KEY=your_key` and `SMS_PROVIDER=textlocal`

### Auto-SMS Triggers
- ✅ Student marked **Absent** → instant SMS to guardian
- 📢 Notice published with SMS toggle → broadcast to parents
- 💰 Fee reminder → bulk SMS to pending/overdue parents

---

## 🔧 Frontend Integration

Update your Next.js frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Example API call:
```javascript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
const data = await res.json();
```

---

## 🧪 Health Check
```
GET http://localhost:5000/api/health
```

---

Built with ❤️ — Node.js · Express · MongoDB · JWT · Fast2SMS
