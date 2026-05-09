const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const dirs = ['uploads/photos', 'uploads/documents', 'uploads/attachments'];
dirs.forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/documents';
    if (file.fieldname === 'photo')      folder = 'uploads/photos';
    if (file.fieldname === 'attachment') folder = 'uploads/attachments';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only images and documents are allowed!'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

module.exports = upload;
