import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import Chatbot from '../components/Chatbot';
import { api } from '../utils/api';

export default function Quiz() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('select'); // select, quiz, result
  const [topic, setTopic] = useState('aptitude');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('hirex_token');
    if (!token) { router.replace('/login'); return; }
    const stored = localStorage.getItem('hirex_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (step === 'quiz' && quiz) {
      const totalTime = quiz.totalQuestions * 60; // 1 min per question
      setTimer(totalTime);
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, quiz]);

  const startQuiz = async () => {
    setLoading(true);
    try {
      const data = await api.generateQuiz(topic);
      setQuiz(data);
      setAnswers({});
      setStep('quiz');
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const selectAnswer = (qIndex, optIndex) => {
    if (result) return;
    setAnswers({ ...answers, [qIndex]: optIndex });
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const ansArray = quiz.questions.map((_, i) => answers[i] !== undefined ? answers[i] : -1);
      const timeTaken = (quiz.totalQuestions * 60) - timer;
      const data = await api.submitQuiz({ quizId: quiz.quizId, answers: ansArray, timeTaken });
      setResult(data);
      setStep('result');
      const u = { ...user, dailyQuizDone: true };
      setUser(u);
      localStorage.setItem('hirex_user', JSON.stringify(u));
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <>
      <Head>
        <title>Mock Test | HireX</title>
        <meta name="description" content="Take timed quizzes on aptitude, logical reasoning, and technical topics" />
      </Head>
      <div className="app-layout">
        <Sidebar user={user} />
        <main className="main-content">
          <div className="page-header fade-in">
            <h1>Mock Test</h1>
            <p>Test your knowledge with timed quizzes on aptitude, logical reasoning, and technical topics</p>
          </div>

          {step === 'select' && (
            <DashboardCard title="Choose a Topic" className="fade-in fade-in-delay-1" style={{ maxWidth: 600 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { val: 'aptitude', label: 'Aptitude & Quantitative', desc: 'Percentages, speed, time, profit/loss' },
                  { val: 'logical', label: 'Logical Reasoning', desc: 'Patterns, series, puzzles, deductions' },
                  { val: 'technical', label: 'Technical MCQs', desc: 'DSA, databases, web, programming' },
                ].map(t => (
                  <div
                    key={t.val}
                    className={`quiz-option ${topic === t.val ? 'selected' : ''}`}
                    onClick={() => setTopic(t.val)}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={startQuiz} disabled={loading}>
                {loading ? 'Generating Quiz...' : 'Start Quiz'}
              </button>
            </DashboardCard>
          )}

          {step === 'quiz' && quiz && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <span className="tag" style={{ textTransform: 'capitalize' }}>{quiz.topic}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 12 }}>
                    {Object.keys(answers).length}/{quiz.totalQuestions} answered
                  </span>
                </div>
                <div className="quiz-timer">{formatTime(timer)}</div>
              </div>

              {quiz.questions.map((q, qi) => (
                <DashboardCard key={qi} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Q{qi + 1}.</span> {q.question}
                  </div>
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`quiz-option ${answers[qi] === oi ? 'selected' : ''}`}
                      onClick={() => selectAnswer(qi, oi)}
                    >
                      <div className="quiz-option-letter">{String.fromCharCode(65 + oi)}</div>
                      <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                    </div>
                  ))}
                </DashboardCard>
              ))}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div className="fade-in">
              <DashboardCard style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {result.score}/{result.total}
                </div>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: 4 }}>Score: {result.percentage}%</div>
              </DashboardCard>

              {result.results && result.results.map((r, i) => (
                <DashboardCard key={i} style={{ marginBottom: 12, borderLeft: `3px solid ${r.correct ? 'var(--emerald-400)' : 'var(--red-400)'}` }}>
                  <div style={{ fontWeight: 600, marginBottom: 10, fontSize: '0.9rem' }}>
                    <span style={{ color: r.correct ? 'var(--emerald-400)' : 'var(--red-400)' }}>{r.correct ? '\u2713' : '\u2717'}</span> Q{i + 1}. {r.question}
                  </div>
                  {r.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`quiz-option ${oi === r.correctAnswer ? 'correct' : ''} ${oi === r.userAnswer && !r.correct ? 'wrong' : ''}`}
                      style={{ cursor: 'default' }}
                    >
                      <div className="quiz-option-letter">{String.fromCharCode(65 + oi)}</div>
                      <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                    </div>
                  ))}
                </DashboardCard>
              ))}

              <button className="btn btn-primary btn-lg" onClick={() => { setStep('select'); setResult(null); setQuiz(null); }} style={{ marginTop: 8 }}>
                Take Another Quiz
              </button>
            </div>
          )}
        </main>
        <Chatbot />
      </div>
    </>
  );
}
