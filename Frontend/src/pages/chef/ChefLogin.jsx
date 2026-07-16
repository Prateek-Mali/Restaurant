import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ChefLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/chef');
    } catch (err) {
      // Only trust the message when it came from our own API. A response without
      // one means we hit something else entirely (a misconfigured API URL landing
      // on the static host, a proxy, etc.) — reporting that as a bad password
      // sends you hunting for the wrong bug.
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response) {
        setError(`Unexpected response from the server (HTTP ${err.response.status}). Check the API URL configuration.`);
      } else {
        setError('Could not reach the server. Check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAF6F0',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 340,
          background: '#FFFFFF',
          border: '1px solid #E7DCCC',
          borderRadius: 16,
          padding: 32,
        }}
      >
        <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, color: '#2B2420' }}>
          Ember &amp; Oak
        </div>
        <div style={{ fontSize: 13, color: '#8C8073', marginBottom: 24 }}>Staff sign in</div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A5148', marginBottom: 6 }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#5A5148', margin: '16px 0 6px' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && (
          <div style={{ marginTop: 14, fontSize: 13, color: '#C24A26', fontWeight: 600 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 22,
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: 'none',
            background: submitting ? '#E7DCCC' : '#2B2420',
            color: submitting ? '#8C8073' : '#FFFFFF',
            fontFamily: 'Manrope, sans-serif',
            fontWeight: 800,
            fontSize: 15,
            cursor: submitting ? 'default' : 'pointer',
          }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 10,
  border: '1.5px solid #E7DCCC',
  fontSize: 14,
  color: '#2B2420',
  outline: 'none',
};
