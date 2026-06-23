import React, { useState, useEffect } from 'react';

export default function UploadScreen({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSpotifyLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://spotify-wrapped-hub.onrender.com/api/login');
      if (!response.ok) throw new Error();
      const data = await response.json();
      window.location.href = data.url;
    } catch (err) {
      setError('We could not establish a connection with Spotify right now. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setLoading(true);
      fetch(`https://spotify-wrapped-hub.onrender.com/api/callback?code=${code}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          onUploadSuccess(data);
        })
        .catch(() => {
          setError('We ran into a slight snag syncing your live tracks. Lets try that again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [onUploadSuccess]);

  const handleDemoExperience = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://spotify-wrapped-hub.onrender.com/api/demo');
      if (!response.ok) throw new Error();
      const data = await response.json();
      onUploadSuccess(data);
    } catch (err) {
      setError('We encountered a snag loading the demo workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('spotifyData', file);

    try {
      const response = await fetch('https://spotify-wrapped-hub.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      onUploadSuccess(data);
    } catch (err) {
      setError('We ran into a slight snag parsing your track logs. Lets try that again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="#1ED760">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.075-.336.135-.668.47-.743 3.856-.88 7.15-.51 9.822 1.13.296.178.387.563.206.858zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.847-.107-.972-.52-.125-.413.108-.847.52-.972 3.676-1.114 8.243-.573 11.35 1.34.367.226.487.706.258 1.074zm.105-2.833C14.432 8.81 8.51 8.613 5.093 9.65c-.524.157-1.076-.142-1.233-.666-.158-.523.142-1.075.666-1.233 3.923-1.19 10.46-.967 14.503 1.434.472.28.623.893.342 1.364-.28.472-.893.622-1.364.34z"/>
          </svg>
          <h1 style={styles.title}>Your Audio Canvas</h1>
        </div>
        <p style={styles.subtitle}>Visualize your custom 2026 audio identity. Connect your profile instantly, import a data log, or preview a simulated environment.</p>
        
        <div style={styles.actionGroup}>
          <button onClick={handleSpotifyLogin} disabled={loading} style={styles.loginBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            Sync with Spotify
          </button>

          <label style={styles.uploadBtn}>
            {loading ? 'Analyzing Streams...' : 'Import History Log'}
            <input type="file" accept=".json" onChange={handleFileChange} disabled={loading} style={{ display: 'none' }} />
          </label>

          <button onClick={handleDemoExperience} disabled={loading} style={styles.demoBtn}>
            Explore Demo Space
          </button>
        </div>

        {error && <p style={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#090909', padding: '20px' },
  card: { background: '#121212', padding: '48px 32px', borderRadius: '24px', maxWidth: '440px', textAlign: 'center', border: '1px solid #1f1f1f', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' },
  logoContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' },
  title: { color: '#FFF', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' },
  subtitle: { color: '#a7a7a7', fontSize: '0.95rem', marginBottom: '32px', lineHeight: '1.6', padding: '0 10px' },
  actionGroup: { display: 'flex', flexDirection: 'column', gap: '14px' },
  loginBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1ED760', color: '#000', padding: '14px 28px', borderRadius: '40px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', border: 'none', transition: 'all 0.2s ease' },
  uploadBtn: { background: '#1a1a1a', color: '#FFF', padding: '14px 28px', borderRadius: '40px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', border: '1px solid #333', transition: 'all 0.2s ease', display: 'block' },
  demoBtn: { background: 'transparent', color: '#b3b3b3', padding: '14px 28px', borderRadius: '40px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem', border: 'none', textDecoration: 'underline', transition: 'all 0.2s ease' },
  errorText: { color: '#ff4d6d', fontSize: '0.85rem', marginTop: '20px', fontWeight: '600', lineHeight: '1.4' }
};