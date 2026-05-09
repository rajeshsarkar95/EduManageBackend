const { PAGINATION } = require('../config/constants');

/**
 * Extract pagination params from request query
 */
exports.getPagination = (req) => {
  const page  = Math.max(1, parseInt(req.query.page)  || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Calculate letter grade from percentage
 */
exports.calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 33) return 'D';
  return 'F';
};

/**
 * Format date to Indian format (DD/MM/YYYY)
 */
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
};

/**
 * Generate a unique receipt number
 */
exports.generateReceiptNo = () => {
  const prefix = 'RCP';
  const ts     = Date.now().toString().slice(-6);
  const rand   = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${ts}-${rand}`;
};

/**
 * Sanitize phone number to 10 digits
 */
exports.sanitizePhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('91') ? cleaned.slice(2) : cleaned.slice(-10);
};

/**
 * Build API response
 */
exports.sendResponse = (res, statusCode, success, message, data = null, extra = {}) => {
  const response = { success, message, ...extra };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Create error object
 */
exports.createError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * Get current academic session string
 */
exports.getCurrentSession = () => {
  const now  = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // Academic year starts in April
  if (month >= 4) return `${year}-${(year + 1).toString().slice(2)}`;
  return `${year - 1}-${year.toString().slice(2)}`;
};
