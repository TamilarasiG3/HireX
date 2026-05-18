import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import Chatbot from '../components/Chatbot';
import { api } from '../utils/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hirex_token');
    if (!token) { router.replace('/login'); return; }
    const stored = localStorage.getItem('hirex_user');
    if (stored) setUser(JSON.parse(stored));
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, progressData] = await Promise.all([
        api.getProfile(),
        api.getProgress()
      ]);
      setUser(profileData);
      setProgress(progressData);
      localStorage.setItem('hirex_user', JSON.stringify(profileData));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>;

  const readiness = user ? Math.round(((user.codingScore || 0) + (user.aptitudeScore || 0) + (user.communicationScore || 0)) / 3) : 0;
  const dailyTasks = [
    { label: 'Coding Practice', time: '30 min', done: user?.dailyCodingDone, path: '/codingPractice', cls: 'coding' },
    { label: 'Mock Test', time: '20 min', path: '/quiz', done: user?.dailyQuizDone, cls: 'quiz' },
    { label: 'Communication', time: '10 min', path: '/mockInterview', done: user?.dailyCommDone, cls: 'comm' },
  ];
  const completedCount = dailyTasks.filter(t => t.done).length;
  const dailyProgress = Math.round((completedCount / dailyTasks.length) * 100);

  // Build weekly chart data from progress history
  const weekData = [];
  if (progress && progress.history) {
    const grouped = {};
    progress.history.forEach(p => {
      const d = new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (!grouped[d]) grouped[d] = { coding: 0, aptitude: 0, comm: 0, count: 0 };
      grouped[d].coding = Math.max(grouped[d].coding, p.codingScore || 0);
      grouped[d].aptitude = Math.max(grouped[d].aptitude, p.aptitudeScore || 0);
      grouped[d].comm = Math.max(grouped[d].comm, p.communicationScore || 0);
      grouped[d].count++;
    });
    Object.entries(grouped).slice(0, 7).forEach(([day, data]) => {
      weekData.push({ day, ...data });
    });
  }
  if (weekData.length === 0) {
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(d => weekData.push({ day: d, coding: 0, aptitude: 0, comm: 0 }));
  }

  // Dream company skill gap
  const companySkills = {
    google: ['JavaScript', 'Python', 'Algorithms', 'System Design', 'Data Structures'],
    microsoft: ['C#', 'JavaScript', 'SQL', 'System Design', 'Azure'],
    amazon: ['Java', 'AWS', 'System Design', 'Algorithms', 'Leadership'],
    default: ['JavaScript', 'Data Structures', 'Algorithms', 'SQL', 'System Design']
  };
  const dreamKey = (user?.dreamCompany || '').toLowerCase();
  const requiredSkills = companySkills[dreamKey] || companySkills.default;
  const userSkills = (user?.skills || []).map(s => s.toLowerCase());
  const matched = requiredSkills.filter(s => userSkills.includes(s.toLowerCase()));
  const missing = requiredSkills.filter(s => !userSkills.includes(s.toLowerCase()));

  return (
    <>
      <Head>
        <title>Dashboard | HireX</title>
        <meta name="description" content="Your personalized placement preparation dashboard" />
      </Head>
      <div className="app-layout">
        <Sidebar user={user} />
        <main className="main-content">
          {/* Welcome */}
          <div className="welcome-card glass-card fade-in">
            <h2>Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}!</h2>
            <p>Let&apos;s continue your placement preparation journey. Complete your daily tasks to boost your readiness!</p>
          </div>

          {/* Stats Row */}
          <div className="grid-4 fade-in fade-in-delay-1" style={{ marginBottom: 24 }}>
            <DashboardCard className="stat-card">
              <div className="stat-value">{readiness}%</div>
              <div className="stat-label">Placement Readiness</div>
            </DashboardCard>
            <DashboardCard className="stat-card">
              <div className="stat-value">{user?.codingScore || 0}%</div>
              <div className="stat-label">Coding Score</div>
            </DashboardCard>
            <DashboardCard className="stat-card">
              <div className="stat-value">{user?.aptitudeScore || 0}%</div>
              <div className="stat-label">Aptitude Score</div>
            </DashboardCard>
            <DashboardCard className="stat-card">
              <div className="stat-value">{user?.communicationScore || 0}%</div>
              <div className="stat-label">Communication</div>
            </DashboardCard>
          </div>

          <div className="grid-2 fade-in fade-in-delay-2" style={{ marginBottom: 24 }}>
            {/* Daily Prep Plan */}
            <DashboardCard title="Daily Preparation Plan (1hr)">
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily Progress</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{dailyProgress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${dailyProgress}%` }} />
                </div>
              </div>
              {dailyTasks.map((task, i) => (
                <div key={i} className="task-card glass-card" style={{ padding: 14, marginBottom: 8, cursor: 'pointer' }} onClick={() => router.push(task.path)}>
                  <div className={`task-icon ${task.cls}`}>{task.label.charAt(0)}</div>
                  <div className="task-info">
                    <h4>{task.label}</h4>
                    <p>{task.time}</p>
                  </div>
                  <div className="task-status">
                    {task.done ? (
                      <div className="checkmark done">{'\u2713'}</div>
                    ) : (
                      <button className="btn btn-primary btn-sm">Start</button>
                    )}
                  </div>
                </div>
              ))}
            </DashboardCard>

            {/* Skill Gap */}
            <DashboardCard title="Skill Gap Analysis">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                For {user?.dreamCompany || 'Your Dream Company'}
              </p>
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Skills You Have ({matched.length})
                </h4>
                <div className="tags-container">
                  {matched.length > 0 ? matched.map((s, i) => (
                    <span key={i} className="tag" style={{ background: 'rgba(5,150,105,0.06)', borderColor: 'rgba(5,150,105,0.2)', color: 'var(--emerald-400)' }}>{s}</span>
                  )) : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update your skills in Profile</span>}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--amber-400)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Skills to Learn ({missing.length})
                </h4>
                <div className="tags-container">
                  {missing.map((s, i) => (
                    <span key={i} className="tag" style={{ background: 'rgba(217,119,6,0.06)', borderColor: 'rgba(217,119,6,0.2)', color: 'var(--amber-400)' }}>{s}</span>
                  ))}
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Weekly Performance */}
          <DashboardCard title="Weekly Performance" className="fade-in fade-in-delay-3">
            <div className="chart-container">
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} /> Coding
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--text-muted)', display: 'inline-block' }} /> Aptitude
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-light)', display: 'inline-block' }} /> Communication
                </span>
              </div>
              <div className="chart-bars">
                {weekData.map((d, i) => (
                  <div key={i} className="chart-bar-group">
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 160 }}>
                      <div className="chart-bar" style={{ height: `${Math.max(d.coding * 1.6, 4)}px` }} />
                      <div className="chart-bar aptitude" style={{ height: `${Math.max(d.aptitude * 1.6, 4)}px` }} />
                      <div className="chart-bar comm" style={{ height: `${Math.max(d.comm * 1.6, 4)}px` }} />
                    </div>
                    <span className="chart-label">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>
        </main>
        <Chatbot />
      </div>
    </>
  );
}
