const express = require('express');
const router = express.Router();
const { generateQuiz, submitQuiz, getHistory } = require('../controllers/quizController');
const auth = require('../middleware/authMiddleware');

router.post('/generate', auth, generateQuiz);
router.post('/submit', auth, submitQuiz);
router.get('/history', auth, getHistory);

module.exports = router;
