const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  codingScore: { type: Number, default: 0 },
  aptitudeScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  codingCompleted: { type: Boolean, default: false },
  quizCompleted: { type: Boolean, default: false },
  commCompleted: { type: Boolean, default: false },
  weekNumber: { type: Number, default: 1 }
});

module.exports = mongoose.model('Progress', progressSchema);
