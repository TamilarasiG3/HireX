const User = require('../models/User');
const Progress = require('../models/Progress');

// Expanded interview question pool (30+ technical, 20+ behavioral)
const interviewQuestions = {
  technical: [
    'Explain the difference between REST and GraphQL.',
    'What is the Virtual DOM and how does React use it?',
    'Describe the SOLID principles in object-oriented design.',
    'What is the difference between SQL and NoSQL databases?',
    'Explain how JavaScript handles asynchronous operations.',
    'What are design patterns? Give an example you have used.',
    'Explain the concept of microservices architecture.',
    'What is the difference between TCP and UDP?',
    'How does garbage collection work in JavaScript?',
    'Explain the concept of closures in JavaScript.',
    'What is the difference between a stack and a queue?',
    'How does a hash map work internally?',
    'Explain the concept of time complexity and Big O notation.',
    'What is the difference between processes and threads?',
    'How do you handle database indexing for performance?',
    'What is the CAP theorem in distributed systems?',
    'Explain the difference between HTTP and HTTPS.',
    'What is the purpose of middleware in a web application?',
    'How does caching improve application performance?',
    'Explain the difference between synchronous and asynchronous programming.',
    'What are WebSockets and when would you use them?',
    'Describe how OAuth 2.0 authentication works.',
    'What is the difference between monolithic and microservices architecture?',
    'Explain the concept of virtual memory in operating systems.',
    'What are Docker containers and how do they differ from virtual machines?',
    'Describe the MVC architecture pattern.',
    'What is dependency injection and why is it useful?',
    'Explain how a binary search tree works.',
    'What is the difference between shallow copy and deep copy?',
    'How do you handle race conditions in concurrent programming?',
    'What is a REST API and what are its key constraints?',
    'Explain the concept of event-driven architecture.',
    'What is normalization in databases and why is it important?',
    'Describe how load balancing works in web applications.',
    'What is the difference between compiled and interpreted languages?'
  ],
  behavioral: [
    'Tell me about a challenging project you worked on.',
    'How do you handle tight deadlines?',
    'Describe a situation where you had to work with a difficult team member.',
    'What is your greatest strength and weakness?',
    'Where do you see yourself in 5 years?',
    'Tell me about a time you failed and what you learned.',
    'How do you prioritize your tasks?',
    'Describe a time you showed leadership.',
    'How do you stay updated with new technologies?',
    'Why should we hire you?',
    'Tell me about a time you had to learn something quickly.',
    'How do you handle constructive criticism?',
    'Describe a situation where you went above and beyond.',
    'How do you manage stress during high-pressure situations?',
    'Tell me about a time you resolved a conflict in your team.',
    'What motivates you to do your best work?',
    'Describe a situation where you had to make a difficult decision.',
    'How do you approach problem-solving when you are stuck?',
    'Tell me about a time you had to adapt to a major change.',
    'What do you consider your greatest professional achievement?',
    'How do you ensure effective communication in a team?',
    'Describe a project where you had to collaborate with cross-functional teams.',
    'How do you balance quality with speed in your work?',
    'Tell me about a time you mentored someone or helped a colleague grow.'
  ]
};

// NLP Helper Functions
function countSentences(text) {
  if (!text) return 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences.length;
}

function getAverageSentenceLength(text) {
  if (!text) return 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0);
  return totalWords / sentences.length;
}

function getVocabularyDiversity(text) {
  if (!text) return 0;
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const uniqueWords = new Set(words);
  return uniqueWords.size / words.length;
}

function countFillerWords(text) {
  if (!text) return 0;
  const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of', 'kind of', 'i mean', 'well', 'so yeah', 'right'];
  const lower = text.toLowerCase();
  let count = 0;
  fillers.forEach(f => {
    const regex = new RegExp('\\b' + f.replace(/\s+/g, '\\s+') + '\\b', 'gi');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}

function detectSTARMethod(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  const starKeywords = {
    situation: ['situation', 'context', 'background', 'scenario', 'when i was', 'at my previous', 'during'],
    task: ['task', 'objective', 'goal', 'responsible for', 'assigned', 'challenge was', 'needed to'],
    action: ['action', 'i decided', 'i implemented', 'i created', 'i developed', 'i led', 'i worked', 'my approach', 'i took'],
    result: ['result', 'outcome', 'achieved', 'improved', 'increased', 'decreased', 'successfully', 'learned', 'impact']
  };
  let score = 0;
  Object.values(starKeywords).forEach(keywords => {
    if (keywords.some(k => lower.includes(k))) score += 25;
  });
  return score;
}

function checkCoherence(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  const connectors = ['because', 'therefore', 'however', 'moreover', 'furthermore', 'in addition',
    'firstly', 'secondly', 'thirdly', 'finally', 'for example', 'for instance',
    'in conclusion', 'as a result', 'on the other hand', 'additionally',
    'consequently', 'meanwhile', 'nevertheless', 'specifically', 'in particular'];
  let found = 0;
  connectors.forEach(c => {
    if (lower.includes(c)) found++;
  });
  return Math.min(found * 8, 100);
}

exports.startInterview = async (req, res) => {
  try {
    // Randomly sample from the large pool - Fisher-Yates shuffle
    const shuffleTech = [...interviewQuestions.technical];
    const shuffleBeh = [...interviewQuestions.behavioral];

    for (let i = shuffleTech.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffleTech[i], shuffleTech[j]] = [shuffleTech[j], shuffleTech[i]];
    }
    for (let i = shuffleBeh.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffleBeh[i], shuffleBeh[j]] = [shuffleBeh[j], shuffleBeh[i]];
    }

    const techQ = shuffleTech.slice(0, 3);
    const behQ = shuffleBeh.slice(0, 2);
    const questions = [...techQ, ...behQ];

    // Final shuffle of combined questions
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    res.json({
      questions,
      totalQuestions: questions.length,
      instructions: 'Answer each question thoughtfully. Your responses will be analyzed for clarity, confidence, and structure.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error starting interview.' });
  }
};

exports.submitInterview = async (req, res) => {
  try {
    const { answers } = req.body; // Array of { question, answer }
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    // Enhanced NLP analysis
    const feedback = answers.map(a => {
      const text = a.answer || '';
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const sentenceCount = countSentences(text);
      const avgSentenceLen = getAverageSentenceLength(text);
      const vocabDiversity = getVocabularyDiversity(text);
      const fillerCount = countFillerWords(text);
      const starScore = detectSTARMethod(text);
      const coherenceScore = checkCoherence(text);

      // Clarity: based on word count, sentence structure, vocabulary diversity
      let clarity = 0;
      if (wordCount > 80) clarity = 85;
      else if (wordCount > 50) clarity = 72;
      else if (wordCount > 30) clarity = 55;
      else if (wordCount > 15) clarity = 38;
      else clarity = 15;

      // Boost for good vocabulary diversity
      if (vocabDiversity > 0.7) clarity += 10;
      else if (vocabDiversity > 0.5) clarity += 5;

      // Penalize for too short or too long sentences
      if (avgSentenceLen >= 10 && avgSentenceLen <= 25) clarity += 5;

      // Confidence: based on word count, assertive language, lack of fillers
      let confidence = 0;
      if (wordCount > 80) confidence = 82;
      else if (wordCount > 50) confidence = 68;
      else if (wordCount > 30) confidence = 52;
      else if (wordCount > 15) confidence = 35;
      else confidence = 12;

      // Penalize fillers
      confidence -= fillerCount * 5;

      // Boost for assertive language
      const assertiveWords = ['i believe', 'i am confident', 'i demonstrated', 'my experience', 'i achieved', 'i successfully'];
      const assertiveCount = assertiveWords.filter(w => text.toLowerCase().includes(w)).length;
      confidence += assertiveCount * 4;

      // Structure: based on coherence, STAR method, sentence count
      let structure = 0;
      if (sentenceCount >= 5) structure = 75;
      else if (sentenceCount >= 3) structure = 58;
      else if (sentenceCount >= 2) structure = 40;
      else structure = 15;

      structure += Math.round(coherenceScore * 0.2);
      structure += Math.round(starScore * 0.15);

      // Clamp all scores to 0-100
      clarity = Math.max(0, Math.min(100, Math.round(clarity)));
      confidence = Math.max(0, Math.min(100, Math.round(confidence)));
      structure = Math.max(0, Math.min(100, Math.round(structure)));

      const overall = Math.round((clarity + confidence + structure) / 3);

      // Generate specific, actionable feedback
      let tip = '';
      if (overall >= 80) {
        tip = 'Excellent response. Your answer demonstrates strong communication skills with clear structure and confident delivery.';
      } else if (overall >= 65) {
        tip = 'Good answer. ';
        if (vocabDiversity < 0.5) tip += 'Try using more varied vocabulary to strengthen your response. ';
        if (fillerCount > 2) tip += 'Reduce filler words like "basically" or "like" to sound more confident. ';
        if (coherenceScore < 30) tip += 'Use transitional phrases like "firstly", "for example", or "as a result" to improve flow. ';
        if (starScore < 50) tip += 'Consider using the STAR method (Situation, Task, Action, Result) for behavioral questions.';
      } else if (overall >= 45) {
        tip = 'Fair attempt. ';
        if (wordCount < 40) tip += 'Elaborate more on your answer with specific examples and details. ';
        if (sentenceCount < 3) tip += 'Break your response into multiple well-formed sentences. ';
        if (starScore < 25) tip += 'Structure your answer using the STAR method for better impact. ';
        tip += 'Practice speaking in complete, structured sentences.';
      } else {
        tip = 'Your answer needs more depth. Try to provide at least 3-4 sentences with specific examples. Use the STAR method (Situation, Task, Action, Result) to organize your thoughts. Practice with structured responses to build confidence.';
      }

      return {
        question: a.question,
        clarity,
        confidence,
        structure,
        overall,
        tip: tip.trim()
      };
    });

    const avgScore = Math.round(feedback.reduce((s, f) => s + f.overall, 0) / feedback.length);

    // Update user
    const user = await User.findById(req.userId);
    user.communicationScore = Math.round((user.communicationScore + avgScore) / 2);
    user.dailyCommDone = true;
    await user.save();

    await Progress.create({
      userId: req.userId,
      communicationScore: avgScore,
      commCompleted: true,
      weekNumber: getWeekNumber()
    });

    res.json({ feedback, averageScore: avgScore });
  } catch (err) {
    console.error('Submit interview error:', err);
    res.status(500).json({ message: 'Error submitting interview.' });
  }
};

exports.getInterviewHistory = async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId, commCompleted: true })
      .sort({ date: -1 }).limit(10);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history.' });
  }
};

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000));
}
