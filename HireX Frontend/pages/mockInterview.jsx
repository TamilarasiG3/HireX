import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import Chatbot from '../components/Chatbot';
import { api } from '../utils/api';

export default function MockInterview() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('intro'); // intro, interview, feedback
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('hirex_token');
    if (!token) { router.replace('/login'); return; }
    const stored = localStorage.getItem('hirex_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Initialize Web Speech API
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setAnswers(prev => ({
          ...prev,
          [currentQ]: (prev[currentQ] || '') + finalTranscript
        }));
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Cleanup on unmount or question change
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentQ]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const data = await api.startInterview();
      setQuestions(data.questions);
      setAnswers({});
      setCurrentQ(0);
      setStep('interview');
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleAnswerChange = (value) => {
    setAnswers({ ...answers, [currentQ]: value });
  };

  const submitInterview = async () => {
    stopRecording();
    setLoading(true);
    try {
      const ansArr = questions.map((q, i) => ({
        question: q,
        answer: answers[i] || ''
      }));
      const data = await api.submitInterview(ansArr);
      setFeedback(data);
      setStep('feedback');
      const u = { ...user, dailyCommDone: true };
      setUser(u);
      localStorage.setItem('hirex_user', JSON.stringify(u));
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Mock Interview | HireX</title>
        <meta name="description" content="Practice mock interviews with voice recognition and detailed NLP feedback" />
      </Head>
      <div className="app-layout">
        <Sidebar user={user} />
        <main className="main-content">
          <div className="page-header fade-in">
            <h1>Mock Interview</h1>
            <p>Practice with our interviewer and get detailed feedback on your responses</p>
          </div>

          {step === 'intro' && (
            <DashboardCard className="fade-in fade-in-delay-1" style={{ maxWidth: 650, textAlign: 'center', padding: 48 }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 12 }}>Ready for your mock interview?</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.7 }}>
                Our interviewer will ask you 5 questions — a mix of technical and behavioral.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>
                Your answers will be analyzed for <strong>clarity</strong>,{' '}
                <strong>confidence</strong>, and{' '}
                <strong>structure</strong>.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 32 }}>
                You can type your answers or use the microphone to speak them.
              </p>
              <button className="btn btn-primary btn-lg" onClick={startInterview} disabled={loading}>
                {loading ? 'Preparing...' : 'Start Interview'}
              </button>
            </DashboardCard>
          )}

          {step === 'interview' && questions.length > 0 && (
            <div className="fade-in" style={{ maxWidth: 750 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <span className="tag">Question {currentQ + 1} of {questions.length}</span>
                <div className="progress-bar-container" style={{ width: 200 }}>
                  <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
                </div>
              </div>

              <div className="interview-question-card glass-card">
                <div className="interview-question-number">Question {currentQ + 1}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.6 }}>{questions[currentQ]}</h3>
              </div>

              <DashboardCard title="Your Answer" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <textarea
                    className="form-input"
                    style={{ minHeight: 180, fontSize: '0.95rem', flex: 1 }}
                    placeholder="Type your answer here or click the microphone button to speak your response..."
                    value={answers[currentQ] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  />
                  <button
                    className={`voice-btn ${isRecording ? 'recording' : ''}`}
                    onClick={toggleRecording}
                    title={isRecording ? 'Stop recording' : 'Start voice input'}
                    type="button"
                  >
                    {isRecording ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" y1="19" x2="12" y2="23" />
                        <line x1="8" y1="23" x2="16" y2="23" />
                      </svg>
                    )}
                  </button>
                </div>
                {isRecording && (
                  <div className="voice-status" style={{ marginTop: 8 }}>
                    <span className="dot"></span>
                    Recording... Speak clearly into your microphone
                  </div>
                )}
              </DashboardCard>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => { stopRecording(); setCurrentQ(Math.max(0, currentQ - 1)); }}
                  disabled={currentQ === 0}
                >
                  Previous
                </button>
                {currentQ < questions.length - 1 ? (
                  <button className="btn btn-primary" onClick={() => { stopRecording(); setCurrentQ(currentQ + 1); }}>
                    Next
                  </button>
                ) : (
                  <button className="btn btn-success btn-lg" onClick={submitInterview} disabled={loading}>
                    {loading ? 'Analyzing...' : 'Submit Interview'}
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'feedback' && feedback && (
            <div className="fade-in">
              <DashboardCard style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
                <div style={{
                  fontSize: '2.5rem', fontWeight: 800,
                  color: 'var(--text-primary)'
                }}>
                  {feedback.averageScore}%
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Overall Interview Score</div>
              </DashboardCard>

              {feedback.feedback && feedback.feedback.map((f, i) => (
                <div key={i} className="feedback-card glass-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="interview-question-number">Question {i + 1}</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 8, lineHeight: 1.5 }}>{f.question}</h4>

                  <div className="feedback-scores">
                    <div className="feedback-score-item">
                      <div className="val">{f.clarity}%</div>
                      <div className="lbl">Clarity</div>
                    </div>
                    <div className="feedback-score-item">
                      <div className="val">{f.confidence}%</div>
                      <div className="lbl">Confidence</div>
                    </div>
                    <div className="feedback-score-item">
                      <div className="val">{f.structure}%</div>
                      <div className="lbl">Structure</div>
                    </div>
                    <div className="feedback-score-item">
                      <div className="val" style={{ color: f.overall >= 70 ? 'var(--emerald-400)' : 'var(--amber-400)' }}>{f.overall}%</div>
                      <div className="lbl">Overall</div>
                    </div>
                  </div>

                  <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {f.tip}
                  </p>
                </div>
              ))}

              <button className="btn btn-primary btn-lg" onClick={() => { setStep('intro'); setFeedback(null); }} style={{ marginTop: 16 }}>
                Practice Again
              </button>
            </div>
          )}
        </main>
        <Chatbot />
      </div>
    </>
  );
}
