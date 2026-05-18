const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, dreamCompany, skills } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      dreamCompany: dreamCompany || '',
      skills: skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [],
      resumePath: req.file ? req.file.path : ''
    });

    res.status(201).json({ message: 'Registration successful. Please login.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Reset daily tasks if last reset was a different day
    const today = new Date().toDateString();
    const lastReset = new Date(user.lastDailyReset).toDateString();
    if (today !== lastReset) {
      user.dailyCodingDone = false;
      user.dailyQuizDone = false;
      user.dailyCommDone = false;
      user.lastDailyReset = new Date();
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        dreamCompany: user.dreamCompany,
        skills: user.skills,
        codingScore: user.codingScore,
        aptitudeScore: user.aptitudeScore,
        communicationScore: user.communicationScore,
        dailyCodingDone: user.dailyCodingDone,
        dailyQuizDone: user.dailyQuizDone,
        dailyCommDone: user.dailyCommDone,
        resumePath: user.resumePath
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};
    if (req.body.skills) {
      updates.skills = typeof req.body.skills === 'string' ? JSON.parse(req.body.skills) : req.body.skills;
    }
    if (req.body.dreamCompany) updates.dreamCompany = req.body.dreamCompany;
    if (req.body.fullName) updates.fullName = req.body.fullName;
    if (req.file) updates.resumePath = req.file.path;

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
