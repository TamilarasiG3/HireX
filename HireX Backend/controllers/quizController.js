const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Progress = require('../models/Progress');

// Built-in quiz questions pool
const questionPool = {
  aptitude: [
    { question: 'A train travels 360 km in 4 hours. What is its speed?', options: ['80 km/h', '90 km/h', '100 km/h', '70 km/h'], correctAnswer: 1 },
    { question: 'If 5x + 3 = 28, what is x?', options: ['3', '4', '5', '6'], correctAnswer: 2 },
    { question: 'What is 15% of 200?', options: ['25', '30', '35', '20'], correctAnswer: 1 },
    { question: 'A shopkeeper buys an item for $80 and sells it for $100. What is the profit percentage?', options: ['20%', '25%', '30%', '15%'], correctAnswer: 1 },
    { question: 'If the ratio of boys to girls is 3:5 and total students are 40, how many girls?', options: ['15', '20', '25', '30'], correctAnswer: 2 },
    { question: 'What comes next: 2, 6, 18, 54, ?', options: ['108', '162', '148', '126'], correctAnswer: 1 },
    { question: 'A cistern fills in 6 hours and empties in 8 hours. How long to fill when both pipes run?', options: ['20 hrs', '24 hrs', '18 hrs', '12 hrs'], correctAnswer: 1 },
    { question: 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What was removed?', options: ['28', '26', '24', '30'], correctAnswer: 0 },
  ],
  logical: [
    { question: 'All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly.', options: ['True', 'False', 'Cannot be determined', 'Partially true'], correctAnswer: 2 },
    { question: 'If APPLE = 50, MANGO = ?', options: ['55', '57', '52', '60'], correctAnswer: 0 },
    { question: 'Find the odd one out: 2, 5, 10, 17, 27, 37', options: ['27', '37', '17', '10'], correctAnswer: 0 },
    { question: 'If A > B, B > C, and C > D, which is the smallest?', options: ['A', 'B', 'C', 'D'], correctAnswer: 3 },
    { question: 'Complete the series: AZ, BY, CX, ?', options: ['DW', 'EV', 'DV', 'EW'], correctAnswer: 0 },
    { question: 'In a row of people, A is 7th from left and 12th from right. How many people total?', options: ['18', '19', '20', '17'], correctAnswer: 0 },
  ],
  technical: [
    { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 1 },
    { question: 'Which data structure uses FIFO?', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctAnswer: 1 },
    { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Query Logic', 'System Query Language', 'Standard Query Layout'], correctAnswer: 0 },
    { question: 'Which of the following is NOT a primitive type in JavaScript?', options: ['string', 'boolean', 'object', 'number'], correctAnswer: 2 },
    { question: 'What is the purpose of an index in a database?', options: ['To store data', 'To speed up queries', 'To encrypt data', 'To validate data'], correctAnswer: 1 },
    { question: 'Which protocol is used for secure web communication?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], correctAnswer: 2 },
    { question: 'What is a closure in JavaScript?', options: ['A function with no return', 'A function that has access to outer scope variables', 'An async function', 'A generator function'], correctAnswer: 1 },
    { question: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort', 'Merge Sort', 'Selection Sort', 'Insertion Sort'], correctAnswer: 1 },
  ]
};

exports.generateQuiz = async (req, res) => {
  try {
    const { topic } = req.body;
    const validTopics = ['aptitude', 'logical', 'technical'];
    const selectedTopic = validTopics.includes(topic) ? topic : validTopics[Math.floor(Math.random() * validTopics.length)];

    const pool = questionPool[selectedTopic];
    // Pick 5 random questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(5, shuffled.length));

    const quizQuestions = selected.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: -1
    }));

    const quiz = await Quiz.create({
      userId: req.userId,
      topic: selectedTopic,
      questions: quizQuestions,
      totalQuestions: quizQuestions.length
    });

    // Return questions without correct answers for the client
    const clientQuestions = quiz.questions.map(q => ({
      question: q.question,
      options: q.options
    }));

    res.json({ quizId: quiz._id, topic: selectedTopic, questions: clientQuestions, totalQuestions: quiz.totalQuestions });
  } catch (err) {
    console.error('Generate quiz error:', err);
    res.status(500).json({ message: 'Error generating quiz.' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    if (quiz.userId.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden.' });

    let score = 0;
    const results = quiz.questions.map((q, i) => {
      const userAns = answers[i] !== undefined ? answers[i] : -1;
      q.userAnswer = userAns;
      const correct = userAns === q.correctAnswer;
      if (correct) score++;
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAns,
        correct
      };
    });

    quiz.score = score;
    quiz.timeTaken = timeTaken || 0;
    quiz.completedAt = new Date();
    await quiz.save();

    // Update user scores
    const user = await User.findById(req.userId);
    const pct = Math.round((score / quiz.totalQuestions) * 100);
    user.aptitudeScore = Math.round((user.aptitudeScore + pct) / 2);
    user.dailyQuizDone = true;
    await user.save();

    // Save progress
    await Progress.create({
      userId: req.userId,
      aptitudeScore: pct,
      quizCompleted: true,
      weekNumber: getWeekNumber()
    });

    res.json({ score, total: quiz.totalQuestions, percentage: pct, results });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ message: 'Error submitting quiz.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.userId }).sort({ completedAt: -1 }).limit(20);
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history.' });
  }
};

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}
