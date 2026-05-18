const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  dreamCompany: { type: String, default: '' },
  skills: [{ type: String }],
  resumePath: { type: String, default: '' },
  codingScore: { type: Number, default: 0 },
  aptitudeScore: { type: Number, default: 0 },
  communicationScore: { type: Number, default: 0 },
  dailyCodingDone: { type: Boolean, default: false },
  dailyQuizDone: { type: Boolean, default: false },
  dailyCommDone: { type: Boolean, default: false },
  lastDailyReset: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
