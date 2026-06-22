import React, { useState } from 'react';

export default function UploadScreen({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('spotifyData', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server error processing your data history.');
      }

      const data = await response.json();
      onUploadSuccess(data); // This triggers App.jsx to switch to the slides
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload and process file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Spotify Wrapped Clone</h1>
        <p style={styles.subtitle}>Drop your streaming history JSON file below to generate your 2026 Wrapped recap.</p>
        
        <label style={styles.uploadBtn}>
          {loading ? 'Analyzing Tracks...' : 'Select History JSON File'}
          <input 
            type="file" 
            accept=".json" 
            onChange={handleFileChange} 
            disabled={loading} 
            style={{ display: 'none' }} 
          />
        </label>

        {error && <p style={styles.errorText}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  card: { background: '#1d1d1d', padding: '40px', borderRadius: '16px', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', border: '1px solid #282828' },
  title: { color: '#1ED760', fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' },
  subtitle: { color: '#b3b3b3', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.4' },
  uploadBtn: { background: '#1ED760', color: '#000', padding: '12px 28px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block', fontSize: '0.95rem', transition: 'transform 0.2s' },
  errorText: { color: '#f43f5e', fontSize: '0.85rem', marginTop: '15px', fontWeight: 'bold' }
};