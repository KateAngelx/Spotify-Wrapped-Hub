import React, { useState, useEffect } from 'react';
import UploadScreen from './UploadScreen';
import WrappedSlides from './WrappedSlides';

function PlaylistPlanner({ rawTracks }) {
  const [vibe, setVibe] = useState('all');
  const [limit, setLimit] = useState(10);
  const [playlistName, setPlaylistName] = useState('My Smart Mix');

  const generateTracks = () => {
    if (!rawTracks || !Array.isArray(rawTracks)) return [];
    let filtered = [...rawTracks];

    if (vibe === 'morning') {
      filtered = filtered.filter(item => {
        const timestamp = item.ts || item.endTime;
        if (!timestamp) return false;
        const hour = new Date(timestamp).getHours();
        return hour >= 6 && hour < 12;
      });
    } else if (vibe === 'night') {
      filtered = filtered.filter(item => {
        const timestamp = item.ts || item.endTime;
        if (!timestamp) return false;
        const hour = new Date(timestamp).getHours();
        return hour >= 22 || hour < 6;
      });
    } else if (vibe === 'heavy') {
      filtered = filtered.filter(item => (item.msPlayed || item.ms_played || 0) > 240000);
    }

    const uniqueTracks = [];
    const seen = new Set();
    for (const item of filtered) {
      const title = item.trackName || item.master_metadata_track_name;
      const artist = item.artistName || item.master_metadata_album_artist;
      if (title && artist) {
        const key = `${title} - ${artist}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueTracks.push({ title, artist });
        }
      }
    }
    return uniqueTracks.slice(0, limit);
  };

  const currentTracks = generateTracks();

  const exportAsM3U = () => {
    if (currentTracks.length === 0) return;
    let fileContent = '#EXTM3U\n';
    currentTracks.forEach(t => {
      fileContent += `#EXTINF:-1,${t.artist} - ${t.title}\n`;
      fileContent += `${t.title} ${t.artist}\n`;
    });
    const blob = new Blob([fileContent], { type: 'audio/x-mpegurl' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${playlistName.replace(/\s+/g, '_')}.m3u`;
    link.click();
  };

  return (
    <div style={plannerStyles.panel}>
      <div style={plannerStyles.bannerHeader}>
        <div style={plannerStyles.playlistCoverPlaceholder}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#535353" strokeWidth="2">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div style={plannerStyles.bannerTextColumn}>
          <span style={plannerStyles.badgeLabel}>SMART MIX ENGINE</span>
          <input 
            type="text" 
            value={playlistName} 
            onChange={(e) => setPlaylistName(e.target.value)} 
            style={plannerStyles.titleInput} 
          />
          <p style={plannerStyles.bannerMeta}>
            Generated audio profile split • <span style={{ color: '#fff' }}>{currentTracks.length} tracks cataloged</span>
          </p>
        </div>
      </div>

      <div style={plannerStyles.actionRow}>
        <button onClick={exportAsM3U} disabled={currentTracks.length === 0} style={plannerStyles.spotifyPlayBtn}>
          Export Compilation
        </button>
        
        <div style={plannerStyles.filterControls}>
          <select value={vibe} onChange={(e) => setVibe(e.target.value)} style={plannerStyles.spotifySelect}>
            <option value="all">Comprehensive Logs</option>
            <option value="morning">Morning Acoustic</option>
            <option value="night">Midnight Sessions</option>
            <option value="heavy">Extended Plays</option>
          </select>

          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={plannerStyles.spotifySelectCompact}>
            <option value="5">5 items</option>
            <option value="10">10 items</option>
            <option value="20">20 items</option>
          </select>
        </div>
      </div>

      <div style={plannerStyles.tableHeaderGrid}>
        <span style={{ width: '30px', textAlign: 'center' }}>#</span>
        <span style={{ flexGrow: 1 }}>TITLE POOL</span>
      </div>
      <div style={plannerStyles.trackContainerStack}>
        {currentTracks.length > 0 ? (
          currentTracks.map((t, idx) => (
            <div key={idx} style={plannerStyles.trackRowItem}>
              <span style={plannerStyles.rowNumber}>{idx + 1}</span>
              <div style={plannerStyles.rowMetaDetails}>
                <p style={plannerStyles.trackTitleText}>{t.title}</p>
                <p style={plannerStyles.trackArtistText}>{t.artist}</p>
              </div>
            </div>
          ))
        ) : (
          <p style={plannerStyles.emptyMsgText}>No tracking points match the current filter parameters.</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [wrappedData, setWrappedData] = useState(null);
  const [rawHistory, setRawHistory] = useState([]);

  const handleUploadSuccess = (serverData, fileInput) => {
    setWrappedData(serverData);
    
    if (fileInput) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          setRawHistory(JSON.parse(e.target.result));
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsText(fileInput);
    } else if (serverData?.topTracks) {
      const mockConverter = [
        ...serverData.topTracks.map(t => ({ trackName: t.name?.split(' by ')[0], artistName: t.name?.split(' by ')[1], ts: new Date().toISOString() })),
        ...serverData.topArtists.map(a => ({ trackName: 'Featured Track', artistName: a.name, ts: new Date().toISOString() }))
      ];
      setRawHistory(mockConverter);
    }
  };

  return (
    <div style={styles.appWrapper}>
      <header style={styles.topLogoNavbar}>
        <div style={styles.logoContainer}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#1ED760">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.075-.336.135-.668.47-.743 3.856-.88 7.15-.51 9.822 1.13.296.178.387.563.206.858zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.847-.107-.972-.52-.125-.413.108-.847.52-.972 3.676-1.114 8.243-.573 11.35 1.34.367.226.487.706.258 1.074zm.105-2.833C14.432 8.81 8.51 8.613 5.093 9.65c-.524.157-1.076-.142-1.233-.666-.158-.523.142-1.075.666-1.233 3.923-1.19 10.46-.967 14.503 1.434.472.28.623.893.342 1.364-.28.472-.893.622-1.364.34z"/>
          </svg>
          <span style={styles.brandTitleText}>
            Spotify Wrapped Engine Clone
          </span>
        </div>
      </header>

      <main style={styles.mainWorkspaceLayout}>
        {!wrappedData ? (
          <UploadScreen onUploadSuccess={(data) => {
            const fileInputElement = document.querySelector('input[type="file"]');
            const fileInput = fileInputElement?.files?.[0] || null;
            handleUploadSuccess(data, fileInput);
          }} />
        ) : (
          <div style={styles.dashboardContainer}>
            <div style={styles.slideColumn}>
              <WrappedSlides data={wrappedData} />
            </div>
            <div style={styles.plannerColumn}>
              <PlaylistPlanner rawTracks={rawHistory} />
            </div>
          </div>
        )}
      </main>

      <footer style={styles.spotifyFooterSection}>
        <p>2026 Spotify Wrapped Engine Clone • Designed for personal analytics data evaluation protocols.</p>
        <p style={{ color: '#333', marginTop: '6px', fontSize: '0.68rem', lineHeight: '1.4' }}>
          This interface uses standard web APIs and metadata mocks. All logos, branding assets, and trademarks belong entirely to Spotify AB.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  appWrapper: { display: 'flex', flexDirection: 'column', width: '100vw', minHeight: '100vh', background: '#000', color: '#fff', boxSizing: 'border-box' },
  topLogoNavbar: { display: 'flex', alignItems: 'center', height: '65px', width: '100%', background: '#000', padding: '0 32px', borderBottom: '1px solid #121212', boxSizing: 'border-box' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '14px' },
  brandTitleText: { fontSize: '1rem', fontWeight: '400', letterSpacing: '0.5px', color: '#b3b3b3', borderLeft: '1px solid #222', paddingLeft: '14px' },
  mainWorkspaceLayout: { display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: '40px 20px', boxSizing: 'border-box', background: 'linear-gradient(180deg, #0c0c0c 0%, #000000 100%)' },
  dashboardContainer: { display: 'flex', flexDirection: 'row', gap: '40px', width: '100%', maxWidth: '980px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' },
  slideColumn: { flex: '1', maxWidth: '385px', minWidth: '320px' },
  plannerColumn: { flex: '1', maxWidth: '480px', minWidth: '320px' },
  spotifyFooterSection: { textAlign: 'center', padding: '24px 20px', background: '#000', color: '#555', fontSize: '0.72rem', borderTop: '1px solid #121212' }
};

const plannerStyles = {
  panel: { background: '#121212', borderRadius: '16px', padding: '24px', width: '100%', boxSizing: 'border-box', border: '1px solid #1f1f1f' },
  bannerHeader: { display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '24px', background: 'linear-gradient(180deg, #1c1c1c 0%, #121212 100%)', padding: '20px', borderRadius: '12px' },
  playlistCoverPlaceholder: { width: '110px', height: '110px', background: '#242424', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
  bannerTextColumn: { display: 'flex', flexDirection: 'column', flexGrow: 1 },
  badgeLabel: { fontSize: '0.62rem', fontWeight: '800', letterSpacing: '1.5px', color: '#b3b3b3', marginBottom: '6px' },
  titleInput: { background: 'transparent', border: 'none', color: '#fff', fontSize: '1.8rem', fontWeight: '900', outline: 'none', padding: '0', width: '100%', borderBottom: '1px solid transparent' },
  bannerMeta: { color: '#a7a7a7', fontSize: '0.8rem', marginTop: '8px', fontWeight: '500' },
  actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' },
  spotifyPlayBtn: { background: '#1ED760', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '40px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.5px' },
  filterControls: { display: 'flex', gap: '10px' },
  spotifySelect: { background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '24px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', outline: 'none' },
  spotifySelectCompact: { background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '24px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', outline: 'none' },
  tableHeaderGrid: { display: 'flex', padding: '0 16px 12px 16px', borderBottom: '1px solid #1f1f1f', color: '#a7a7a7', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '1px' },
  trackContainerStack: { display: 'flex', flexDirection: 'column', height: '240px', overflowY: 'auto', marginTop: '8px' },
  trackRowItem: { display: 'flex', alignItems: 'center', padding: '10px 16px', borderRadius: '8px', transition: 'background 0.2s' },
  rowNumber: { width: '30px', textAlign: 'center', color: '#a7a7a7', fontSize: '0.85rem', fontWeight: '600' },
  rowMetaDetails: { display: 'flex', flexDirection: 'column' },
  trackTitleText: { color: '#fff', fontSize: '0.9rem', fontWeight: '600', margin: 0 },
  trackArtistText: { color: '#a7a7a7', fontSize: '0.8rem', margin: 0, marginTop: '3px' },
  emptyMsgText: { color: '#555', fontSize: '0.8rem', padding: '60px 40px', textAlign: 'center', fontWeight: '500' }
};