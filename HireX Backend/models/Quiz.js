const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    userAnswer: { type: Number, default: -1 }
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
