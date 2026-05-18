import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import Chatbot from '../components/Chatbot';
import { api } from '../utils/api';

const avatarList = [
  { id: 1, src: '/avatars/avatar1.png', label: 'Purple Hoodie' },
  { id: 2, src: '/avatars/avatar2.png', label: 'Headphones Girl' },
  { id: 3, src: '/avatars/avatar3.png', label: 'Glasses Guy' },
  { id: 4, src: '/avatars/avatar4.png', label: 'Pink Hair' },
  { id: 5, src: '/avatars/avatar5.png', label: 'Bomber Jacket' },
  { id: 6, src: '/avatars/avatar6.png', label: 'Turtleneck' },
];

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', dreamCompany: '', skills: '' });
  const [resume, setResume] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('hirex_token');
    if (!token) { router.replace('/login'); return; }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setUser(data);
      setForm({
        fullName: data.fullName || '',
        dreamCompany: data.dreamCompany || '',
        skills: (data.skills || []).join(', ')
      });
      localStorage.setItem('hirex_user', JSON.stringify(data));
      const savedAv = localStorage.getItem('hirex_avatar');
      if (savedAv) setSelectedAvatar(parseInt(savedAv));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('dreamCompany', form.dreamCompany);
      formData.append('skills', JSON.stringify(form.skills.split(',').map(s => s.trim()).filter(Boolean)));
      if (resume) formData.append('resume', resume);

      const updated = await api.updateProfile(formData);
      setUser(updated);
      localStorage.setItem('hirex_user', JSON.stringify(updated));
      setEditing(false);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err.message);
    }
    setSaving(false);
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>;

  const readiness = user ? Math.round(((user.codingScore || 0) + (user.aptitudeScore || 0) + (user.communicationScore || 0)) / 3) : 0;
  const currentAv = avatarList.find(a => a.id === selectedAvatar) || avatarList[0];

  return (
    <>
      <Head>
        <title>Profile | HireX</title>
        <meta name="description" content="View and update your HireX profile" />
      </Head>
      <div className="app-layout">
        <Sidebar user={user} />
        <main className="main-content">
          <div className="page-header fade-in">
            <h1>Profile</h1>
            <p>View and manage your account information</p>
          </div>

          {msg && <div className={msg.includes('success') ? 'success-message' : 'error-message'} style={{ marginBottom: 20 }}>{msg}</div>}

          <DashboardCard className="fade-in fade-in-delay-1" style={{ marginBottom: 24 }}>
            <div className="profile-header">
              <div className="profile-avatar-wrapper">
                <img src={currentAv.src} alt="Avatar" className="profile-avatar-img" />
              </div>
              <div className="profile-info" style={{ flex: 1 }}>
                <h2>{user?.fullName}</h2>
                <p>{user?.email}</p>
                {user?.dreamCompany && (
                  <span className="tag" style={{ marginTop: 8 }}>Dream: {user.dreamCompany}</span>
                )}
              </div>
              <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </DashboardCard>

          <div className="grid-2 fade-in fade-in-delay-2" style={{ marginBottom: 24 }}>
            {/* Readiness Score */}
            <DashboardCard title="Placement Readiness">
              <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                <div className="score-circle" style={{ '--score': readiness }}>
                  <div className="score-circle-inner">
                    <div className="score-value">{readiness}%</div>
                    <div className="score-label">Ready</div>
                  </div>
                </div>
              </div>
              <div className="grid-3" style={{ marginTop: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.codingScore || 0}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Coding</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.aptitudeScore || 0}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aptitude</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.communicationScore || 0}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Comm</div>
                </div>
              </div>
            </DashboardCard>

            {/* Skills */}
            <DashboardCard title="Skills">
              {user?.skills?.length > 0 ? (
                <div className="tags-container" style={{ marginBottom: 16 }}>
                  {user.skills.map((s, i) => <span key={i} className="tag">{s}</span>)}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills added yet. Click Edit to add your skills.</p>
              )}
              {user?.resumePath && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--accent-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Resume uploaded</span>
                </div>
              )}
            </DashboardCard>
          </div>

          {/* Edit Form */}
          {editing && (
            <DashboardCard title="Edit Profile" className="fade-in" style={{ maxWidth: 600 }}>
              <div className="form-group">
                <label>Choose Avatar</label>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                  {avatarList.map(av => (
                    <div
                      key={av.id}
                      onClick={() => { setSelectedAvatar(av.id); localStorage.setItem('hirex_avatar', av.id); }}
                      className="avatar-pick"
                      style={{
                        cursor: 'pointer',
                        borderRadius: '50%',
                        border: selectedAvatar === av.id ? '3px solid var(--accent)' : '3px solid transparent',
                        padding: 2,
                        transition: 'all 0.3s',
                        transform: selectedAvatar === av.id ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      <img src={av.src} alt={av.label} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Dream Company</label>
                <input className="form-input" value={form.dreamCompany} onChange={(e) => setForm({ ...form, dreamCompany: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input className="form-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="JavaScript, Python, React" />
              </div>
              <div className="form-group">
                <label>Upload New Resume (PDF)</label>
                <input className="form-input" type="file" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} />
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </DashboardCard>
          )}
        </main>
        <Chatbot />
      </div>
    </>
  );
}
