import React, { useState } from 'react';
import UploadScreen from './UploadScreen';
import WrappedSlides from './WrappedSlides';

// Sub-Component: Spotify Layout Playlist Planner
function PlaylistPlanner({ rawTracks }) {
  const [vibe, setVibe] = useState('all');
  const [limit, setLimit] = useState(10);
  const [playlistName, setPlaylistName] = useState('My Smart Mix');

  const generateTracks = () => {
    if (!rawTracks || !Array.isArray(rawTracks)) return [];
    let filtered = [...rawTracks];

    if (vibe === 'morning') {
      filtered = filtered.filter(item => {
        const hour = new Date(item.ts || item.endTime).getHours();
        return hour >= 6 && hour < 12;
      });
    } else if (vibe === 'night') {
      filtered = filtered.filter(item => {
        const hour = new Date(item.ts || item.endTime).getHours();
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
      {/* HEADER SECTION: Spotify Playlist Banner style */}
      <div style={plannerStyles.bannerHeader}>
        <div style={plannerStyles.playlistCoverPlaceholder}>
          <span style={{ fontSize: '3rem' }}>🎵</span>
        </div>
        <div style={plannerStyles.bannerTextColumn}>
          <span style={plannerStyles.badgeLabel}>PUBLIC PLAYLIST</span>
          <input 
            type="text" 
            value={playlistName} 
            onChange={(e) => setPlaylistName(e.target.value)} 
            style={plannerStyles.titleInput} 
          />
          <p style={plannerStyles.bannerMeta}>
            Created from your data • <span style={{ color: '#fff' }}>{currentTracks.length} songs</span>
          </p>
        </div>
      </div>

      {/* CONTROLS BAR */}
      <div style={plannerStyles.actionRow}>
        <button onClick={exportAsM3U} disabled={currentTracks.length === 0} style={plannerStyles.spotifyPlayBtn}>
          📥 Export to Media Player
        </button>
        
        <div style={plannerStyles.filterControls}>
          <select value={vibe} onChange={(e) => setVibe(e.target.value)} style={plannerStyles.spotifySelect}>
            <option value="all">All-Time Tracks</option>
            <option value="morning">Morning Vibe</option>
            <option value="night">Midnight Vibe</option>
            <option value="heavy">Deep Sessions (&gt;4m)</option>
          </select>

          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={plannerStyles.spotifySelectCompact}>
            <option value="5">5 Tracks</option>
            <option value="10">10 Tracks</option>
            <option value="20">20 Tracks</option>
          </select>
        </div>
      </div>

      {/* TRACKS LIST: Styled precisely like Spotify's desktop layout grid */}
      <div style={plannerStyles.tableHeaderGrid}>
        <span style={{ width: '30px', textAlign: 'center' }}>#</span>
        <span style={{ flexGrow: 1 }}>TITLE</span>
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
          <p style={plannerStyles.emptyMsgText}>No matching tracks found for this specific filter rule.</p>
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
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setRawHistory(JSON.parse(e.target.result));
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsText(fileInput);
  };

  return (
    <div style={styles.appWrapper}>
      {/* TOP NAV BAR HEADER WITH LOGO PLACEHOLDER */}
      <header style={styles.topLogoNavbar}>
        <div style={styles.logoContainer}>
          <img 
            src="/Spotify_Full_Logo_RGB_Green.png" 
            alt="Spotify Logo" 
            style={{ height: '35px', objectFit: 'contain' }} 
          />
          <span style={{ ...styles.brandTitleText, borderLeft: '1px solid #282828', paddingLeft: '12px', marginLeft: '4px', color: '#b3b3b3', fontWeight: '300' }}>
          Spotify Wrapped Engine Clone
          </span>
        </div>
      </header>

      <main style={styles.mainWorkspaceLayout}>
        {!wrappedData ? (
          <UploadScreen onUploadSuccess={(data) => {
            const fileInput = document.querySelector('input[type="file"]').files[0];
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

      {/* FOOTER CREDITS SECTION */}
      <footer style={styles.spotifyFooterSection}>
        <p>© 2026 Spotify Wrapped Engine Clone • Designed for personal analytics data evaluation protocols.</p>
        <p style={{ color: '#535353', marginTop: '4px', fontSize: '0.7rem' }}>
          This interface uses standard web APIs and metadata mocks. All logos, branding assets, and trademarks belong entirely to Spotify AB.
        </p>
      </footer>
    </div>
  );
}

// --- CORE MASTER COMPONENT CSS SCHEMES ---
const styles = {
  appWrapper: { display: 'flex', flexDirection: 'column', width: '100vw', minHeight: '100vh', background: '#000', color: '#fff', boxSizing: 'border-box' },
  topLogoNavbar: { display: 'flex', alignItems: 'center', height: '65px', width: '100%', background: '#000', padding: '0 32px', borderBottom: '1px solid #121212', boxSizing: 'border-box' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  mockSpotifyLogoCircle: { background: '#1ED760', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '3px' },
  waveBar: { background: '#000', width: '16px', height: '3px', borderRadius: '2px' },
  waveBarShort: { background: '#000', width: '12px', height: '2.5px', borderRadius: '2px' },
  brandTitleText: { fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '-0.5px' },
  mainWorkspaceLayout: { display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: '40px 20px', boxSizing: 'border-box', background: 'linear-gradient(180deg, #121212 0%, #000000 100%)' },
  dashboardContainer: { display: 'flex', flexDirection: 'row', gap: '40px', width: '100%', maxWidth: '980px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' },
  slideColumn: { flex: '1', maxWidth: '385px', minWidth: '320px' },
  plannerColumn: { flex: '1', maxWidth: '480px', minWidth: '320px' },
  spotifyFooterSection: { textAlign: 'center', padding: '24px 20px', background: '#000', color: '#b3b3b3', fontSize: '0.75rem', borderTop: '1px solid #121212' }
};

// --- SPOTIFY-SPECIFIC INTERACTIVE COMPONENT STYLES ---
const plannerStyles = {
  panel: { background: '#121212', borderRadius: '10px', padding: '24px', width: '100%', boxSizing: 'border-box', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
  bannerHeader: { display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '24px', background: 'linear-gradient(180deg, #282828 0%, #121212 100%)', padding: '20px', borderRadius: '8px 8px 0 0' },
  playlistCoverPlaceholder: { width: '120px', height: '120px', background: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
  bannerTextColumn: { display: 'flex', flexDirection: 'column', flexGrow: 1 },
  badgeLabel: { fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px', color: '#fff', marginBottom: '4px' },
  titleInput: { background: 'transparent', border: 'none', color: '#fff', fontSize: '2.2rem', fontWeight: '900', outline: 'none', padding: '0', width: '100%', borderBottom: '1px dashed transparent', cursor: 'text' },
  bannerMeta: { color: '#b3b3b3', fontSize: '0.85rem', marginTop: '8px', fontWeight: '500' },
  actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', flexWrap: 'wrap' },
  spotifyPlayBtn: { background: '#1ED760', color: '#000', border: 'none', padding: '14px 28px', borderRadius: '30px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', letterSpacing: '0.2px', textTransform: 'uppercase', transition: 'transform 0.1s' },
  filterControls: { display: 'flex', gap: '10px' },
  spotifySelect: { background: '#282828', border: 'none', color: '#fff', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },
  spotifySelectCompact: { background: '#282828', border: 'none', color: '#fff', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },
  tableHeaderGrid: { display: 'flex', padding: '0 16px 8px 16px', borderBottom: '1px solid #282828', color: '#b3b3b3', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px' },
  trackContainerStack: { display: 'flex', flexDirection: 'column', height: '240px', overflowY: 'auto', marginTop: '8px' },
  trackRowItem: { display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '4px', transition: 'background 0.2s', cursor: 'default' },
  rowNumber: { width: '30px', textAlign: 'center', color: '#b3b3b3', fontSize: '0.9rem' },
  rowMetaDetails: { display: 'flex', flexDirection: 'column' },
  trackTitleText: { color: '#fff', fontSize: '0.9rem', fontWeight: '500', margin: 0 },
  trackArtistText: { color: '#b3b3b3', fontSize: '0.8rem', margin: 0, marginTop: '2px' },
  emptyMsgText: { color: '#535353', fontSize: '0.85rem', padding: '40px', textAlign: 'center' }
};