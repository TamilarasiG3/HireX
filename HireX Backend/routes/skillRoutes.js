const express = require('express');
const router = express.Router();
const { getDailyProblem, submitSolution } = require('../controllers/skillController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Progress = require('../models/Progress');

router.get('/daily-problem', auth, getDailyProblem);
router.post('/submit-solution', auth, submitSolution);

// Get progress data for charts
router.get('/progress', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId }).sort({ date: -1 }).limit(30);
    const user = await User.findById(req.userId).select('-password');
    res.json({
      user: {
        codingScore: user.codingScore,
        aptitudeScore: user.aptitudeScore,
        communicationScore: user.communicationScore,
        dailyCodingDone: user.dailyCodingDone,
        dailyQuizDone: user.dailyQuizDone,
        dailyCommDone: user.dailyCommDone
      },
      history: progress
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress.' });
  }
});

// AI Chatbot endpoint
router.post('/chatbot', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required.' });

    const user = await User.findById(req.userId);
    const reply = generateMentorResponse(message, user);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: 'Error processing message.' });
  }
});

function generateMentorResponse(message, user) {
  const msg = message.toLowerCase();

  if (msg.includes('dsa') || msg.includes('data structure') || msg.includes('algorithm')) {
    return "Great question about DSA! 🚀 Here's my advice:\n\n1. **Start with Arrays & Strings** - they appear in 40% of interviews\n2. **Master Sorting & Searching** - Binary Search is a must\n3. **Practice Trees & Graphs** - Focus on BFS/DFS traversals\n4. **Learn Dynamic Programming** - Start with simple problems like Fibonacci, Climbing Stairs\n5. **Practice daily** on platforms like LeetCode\n\nYour current coding score is " + user.codingScore + "%. Keep practicing! 💪";
  }

  if (msg.includes('interview') || msg.includes('preparation') || msg.includes('prepare')) {
    return "Here's a structured interview preparation plan! 📋\n\n**Week 1-2:** Revise core CS fundamentals\n**Week 3-4:** Practice coding problems daily\n**Week 5-6:** Mock interviews and behavioral questions\n**Week 7-8:** Company-specific preparation\n\n**Tips:**\n- Research " + (user.dreamCompany || 'your dream company') + " thoroughly\n- Practice the STAR method for behavioral questions\n- Do at least 2-3 mock interviews per week\n- Focus on system design for senior roles";
  }

  if (msg.includes('resume') || msg.includes('cv')) {
    return "Resume tips for placement success! 📄\n\n1. **Keep it 1 page** - Recruiters spend 6 seconds on average\n2. **Quantify achievements** - Use numbers and percentages\n3. **List relevant projects** - Include tech stack used\n4. **Add your skills:** " + (user.skills.join(', ') || 'Update your skills in profile') + "\n5. **Proofread** - No typos or grammatical errors\n6. **Use action verbs** - Built, Designed, Implemented, Optimized";
  }

  if (msg.includes('coding') || msg.includes('practice') || msg.includes('leetcode')) {
    return "Coding practice strategy! 💻\n\n**Daily Plan:**\n- Solve 2-3 easy problems (20 min each)\n- Attempt 1 medium problem (30 min)\n- Review solutions you couldn't solve\n\n**Key Topics:**\n1. Arrays & Hash Maps\n2. Two Pointers & Sliding Window\n3. Stack & Queue\n4. Binary Search\n5. Tree & Graph Traversal\n6. Dynamic Programming\n\nYour coding score: " + user.codingScore + "% - " + (user.codingScore >= 70 ? "You're doing great!" : "Keep practicing to improve!");
  }

  if (msg.includes('aptitude') || msg.includes('quantitative') || msg.includes('reasoning')) {
    return "Aptitude preparation guide! 🧮\n\n**Important Topics:**\n1. Percentages & Profit/Loss\n2. Time, Speed & Distance\n3. Probability\n4. Permutations & Combinations\n5. Logical Reasoning & Puzzles\n\n**Tips:**\n- Learn shortcut formulas\n- Practice mental math\n- Take timed tests regularly\n\nYour aptitude score: " + user.aptitudeScore + "%";
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello " + user.fullName + "! 👋 Welcome to HireX Mentor!\n\nI'm here to help you with:\n🔹 Coding & DSA strategies\n🔹 Interview preparation\n🔹 Resume building tips\n🔹 Aptitude & reasoning guidance\n🔹 Career advice\n\nWhat would you like to know about?";
  }

  if (msg.includes('company') || msg.includes('job') || msg.includes('placement')) {
    return "Placement preparation for " + (user.dreamCompany || 'your dream company') + "! 🎯\n\n**General Strategy:**\n1. Research company culture & values\n2. Study common interview patterns\n3. Review past placement questions\n4. Build projects relevant to the role\n5. Network with alumni who work there\n\n**Your Readiness:**\n- Coding: " + user.codingScore + "%\n- Aptitude: " + user.aptitudeScore + "%\n- Communication: " + user.communicationScore + "%\n\nFocus on improving your weakest area first!";
  }

  return "Thanks for your question! 🤔\n\nI can help you with:\n\n📖 **Coding & DSA** - Ask about data structures, algorithms\n🎤 **Interview Prep** - Tips for technical & HR rounds\n📄 **Resume Tips** - How to build a great resume\n🧮 **Aptitude** - Quantitative & logical reasoning\n🏢 **Company Prep** - Placement-specific guidance\n\nTry asking something like:\n- \"How to prepare for interviews?\"\n- \"Tips for DSA practice\"\n- \"How to improve my resume?\"";
}

module.exports = router;
