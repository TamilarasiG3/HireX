import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '../utils/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    dreamCompany: '', skills: ''
  });
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      return setError('Please fill in all required fields.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('confirmPassword', form.confirmPassword);
      formData.append('dreamCompany', form.dreamCompany);
      formData.append('skills', JSON.stringify(form.skills.split(',').map(s => s.trim()).filter(Boolean)));
      if (resume) formData.append('resume', resume);

      await api.register(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Register | HireX</title>
        <meta name="description" content="Create your HireX account and start your placement preparation journey." />
      </Head>
      <div className="auth-container">
        <div className="glass-card auth-card">
          <div className="auth-logo">
            <h1>HireX</h1>
            <p>Create your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input className="form-input" name="fullName" placeholder="John Doe" value={form.fullName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input className="form-input" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Password *</label>
                <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input className="form-input" name="confirmPassword" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Dream Company</label>
              <input className="form-input" name="dreamCompany" placeholder="e.g. Google, Microsoft" value={form.dreamCompany} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input className="form-input" name="skills" placeholder="JavaScript, Python, React" value={form.skills} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Resume (PDF)</label>
              <input className="form-input" type="file" accept=".pdf" onChange={(e) => setResume(e.target.files[0])} />
            </div>
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link href="/login">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
}
