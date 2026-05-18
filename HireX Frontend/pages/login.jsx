import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { api } from '../utils/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Please fill in all fields.');

    setLoading(true);
    try {
      const data = await api.login(form);
      localStorage.setItem('hirex_token', data.token);
      localStorage.setItem('hirex_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | HireX</title>
        <meta name="description" content="Login to your HireX account to continue your placement preparation." />
      </Head>
      <div className="auth-container">
        <div className="glass-card auth-card">
          <div className="auth-logo">
            <h1>HireX</h1>
            <p>Welcome back! Login to continue</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
            </div>
            <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link href="/register">Register here</Link>
          </div>
        </div>
      </div>
    </>
  );
}
