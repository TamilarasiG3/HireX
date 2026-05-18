const express = require('express');
const router = express.Router();
const { startInterview, submitInterview, getInterviewHistory } = require('../controllers/interviewController');
const auth = require('../middleware/authMiddleware');

router.get('/start', auth, startInterview);
router.post('/submit', auth, submitInterview);
router.get('/history', auth, getInterviewHistory);

module.exports = router;
