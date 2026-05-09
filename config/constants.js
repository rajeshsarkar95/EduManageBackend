module.exports = {
  ROLES: {
    ADMIN:   'admin',
    TEACHER: 'teacher',
  },
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT:  'absent',
    LATE:    'late',
    HOLIDAY: 'holiday',
  },
  FEE_STATUS: {
    PAID:    'paid',
    PENDING: 'pending',
    OVERDUE: 'overdue',
  },
  EXAM_STATUS: {
    UPCOMING:  'upcoming',
    ONGOING:   'ongoing',
    COMPLETED: 'completed',
  },
  BOOK_STATUS: {
    AVAILABLE: 'available',
    ISSUED:    'issued',
    LOST:      'lost',
  },
  NOTICE_PRIORITY: {
    LOW:    'low',
    MEDIUM: 'medium',
    HIGH:   'high',
    URGENT: 'urgent',
  },
  SMS_TYPES: {
    ABSENT:       'absent',
    NOTICE:       'notice',
    FEE_REMINDER: 'fee_reminder',
    GENERAL:      'general',
    EXAM:         'exam',
  },
  TRANSPORT_STATUS:{
    ACTIVE:      'active',
    INACTIVE:    'inactive',
    MAINTENANCE: 'maintenance',
  },
  GRADES: ['A+','A','B+','B','C+','C','D','F'],
  PAGINATION: {
    DEFAULT_PAGE:  1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT:     100,
  },
};
