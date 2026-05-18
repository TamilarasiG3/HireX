import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import Chatbot from '../components/Chatbot';
import { api } from '../utils/api';

export default function CodingPractice() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('// Write your solution here\n\n');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('hirex_token');
    if (!token) { router.replace('/login'); return; }
    const stored = localStorage.getItem('hirex_user');
    if (stored) setUser(JSON.parse(stored));
    loadProblem();
  }, []);

  const loadProblem = async () => {
    try {
      const data = await api.getDailyProblem();
      setProblem(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    try {
      const data = await api.submitSolution({ problemId: problem.id, code });
      setResult(data);
      // Update local user
      const u = { ...user, dailyCodingDone: true };
      setUser(u);
      localStorage.setItem('hirex_user', JSON.stringify(u));
    } catch (err) {
      setResult({ message: err.message, score: 0 });
    }
    setSubmitting(false);
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>;

  return (
    <>
      <Head>
        <title>Coding Practice | HireX</title>
        <meta name="description" content="Daily DSA coding challenges for placement preparation" />
      </Head>
      <div className="app-layout">
        <Sidebar user={user} />
        <main className="main-content">
          <div className="page-header fade-in">
            <h1>Coding Practice</h1>
            <p>Solve today&apos;s DSA challenge to improve your coding skills</p>
          </div>

          {problem && (
            <div className="grid-2 fade-in fade-in-delay-1">
              {/* Problem Description */}
              <DashboardCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{problem.title}</h3>
                  <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                  {problem.description}
                </div>
                <DashboardCard title="Example" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                  <pre style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {problem.examples}
                  </pre>
                </DashboardCard>
                {problem.hint && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(217,119,6,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217,119,6,0.15)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--amber-400)' }}>Hint: {problem.hint}</span>
                  </div>
                )}
              </DashboardCard>

              {/* Code Editor */}
              <div>
                <DashboardCard title="Your Solution">
                  <textarea
                    className="code-editor"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                  />
                  <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Solution'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setCode('// Write your solution here\n\n')}>
                      Clear
                    </button>
                  </div>
                </DashboardCard>

                {result && (
                  <DashboardCard title="Result" className="fade-in" style={{ marginTop: 16 }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: result.score >= 70 ? 'var(--emerald-400)' : 'var(--amber-400)', marginBottom: 8 }}>
                      Score: {result.score}%
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>{result.message}</p>
                    {result.solution && (
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Reference Solution:</h4>
                        <pre style={{ background: '#1a1a2e', padding: 16, borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#e6edf3', overflow: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          {result.solution}
                        </pre>
                      </div>
                    )}
                  </DashboardCard>
                )}
              </div>
            </div>
          )}
        </main>
        <Chatbot />
      </div>
    </>
  );
}
