const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// Multer config for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/register', upload.single('resume'), register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, upload.single('resume'), updateProfile);

module.exports = router;
