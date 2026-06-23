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
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
        <div style={plannerStyles.bannerTextColumn}>
          <span style={plannerStyles.badgeLabel}>PLAYLIST</span>
          <input 
            type="text" 
            value={playlistName} 
            onChange={(e) => setPlaylistName(e.target.value)} 
            style={plannerStyles.titleInput} 
          />
          <p style={plannerStyles.bannerMeta}>
            Created from your metrics • <span style={{ color: '#fff' }}>{currentTracks.length} tracks</span>
          </p>
        </div>
      </div>

      <div style={plannerStyles.actionRow}>
        <button onClick={exportAsM3U} disabled={currentTracks.length === 0} style={plannerStyles.spotifyPlayBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
          Export
        </button>
        
        <div style={plannerStyles.filterControls}>
          <select value={vibe} onChange={(e) => setVibe(e.target.value)} style={plannerStyles.spotifySelect}>
            <option value="all">All Logs</option>
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
        <span style={{ width: '40px', textAlign: 'left', paddingLeft: '8px' }}>#</span>
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
          <p style={plannerStyles.emptyMsgText}>No matching tracks found for this filter ruleset.</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [wrappedData, setWrappedData] = useState(null);
  const [rawHistory, setRawHistory] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // Clear token parameters out of the address bar instantly for high security
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code')) {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [wrappedData]);

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

  const handleResetSession = () => {
    setWrappedData(null);
    setRawHistory([]);
    setShowSettings(false);
  };

  return (
    <div style={styles.appWrapper}>
      {/* Dynamic Header with Navigation & Settings System */}
      <header style={styles.topLogoNavbar}>
        <div style={styles.logoContainer}>
          {wrappedData && (
            <button onClick={handleResetSession} style={styles.navBackBtn} title="Go Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#1ED760">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.075-.336.135-.668.47-.743 3.856-.88 7.15-.51 9.822 1.13.296.178.387.563.206.858zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.082-1.182-.413.125-.847-.107-.972-.52-.125-.413.108-.847.52-.972 3.676-1.114 8.243-.573 11.35 1.34.367.226.487.706.258 1.074zm.105-2.833C14.432 8.81 8.51 8.613 5.093 9.65c-.524.157-1.076-.142-1.233-.666-.158-.523.142-1.075.666-1.233 3.923-1.19 10.46-.967 14.503 1.434.472.28.623.893.342 1.364-.28.472-.893.622-1.364.34z"/>
          </svg>
          <span style={styles.brandTitleText}>Spotify Wrapped Hub</span>
        </div>

        <div style={styles.navActionCluster}>
          <button onClick={() => setShowSettings(!showSettings)} style={{...styles.navUtilityBtn, color: showSettings ? '#1ED760' : '#b3b3b3'}} title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      {showSettings && (
        <div style={styles.settingsOverlayPanel}>
          <h3 style={styles.settingsPanelTitle}>Privacy & System Configuration</h3>
          <p style={styles.settingsPanelDesc}>Your streaming datasets are isolated temporarily within volatile local session variables. Memory states clean out automatically upon application disconnect rules.</p>
          <button onClick={handleResetSession} style={styles.clearDataBtn}>
            Disconnect Profile Session
          </button>
        </div>
      )}

      {/* 📱 MOBILE CONTENT VIEWPORT SCROLL WRAPPER */}
      <div style={styles.scrollableContentWrapper}>
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

        {/* Corporate Anchored Footer System */}
        <footer style={styles.spotifyFooterSection}>
          <p style={styles.footerPrimaryText}>2026 Spotify Wrapped Hub • Designed for secure metrics aggregation protocols.</p>
          <p style={styles.footerSecondaryText}>
            This interface uses temporary memory states. All interface layouts, typography styles, trademarks, and design branding belong entirely to Spotify AB.
          </p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  appWrapper: { display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#000', color: '#fff', boxSizing: 'border-box', fontFamily: 'Circular Sp, Circular, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, Arial, sans-serif', overflow: 'hidden' },
  topLogoNavbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', width: '100%', background: '#000', padding: '0 16px', boxSizing: 'border-box', position: 'relative', zIndex: 30 },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  navBackBtn: { background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.2s' },
  brandTitleText: { fontSize: '0.88rem', fontWeight: '700', letterSpacing: '-0.1px', color: '#fff' },
  navActionCluster: { display: 'flex', alignItems: 'center' },
  navUtilityBtn: { background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', transition: 'color 0.2s' },
  settingsOverlayPanel: { background: '#121212', borderBottom: '1px solid #282828', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative', zIndex: 25 },
  settingsPanelTitle: { margin: 0, fontSize: '0.88rem', fontWeight: '700', color: '#fff' },
  settingsPanelDesc: { margin: 0, fontSize: '0.78rem', color: '#b3b3b3', lineHeight: '1.4', maxWidth: '500px' },
  clearDataBtn: { background: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', marginTop: '6px', alignSelf: 'flex-start', transition: 'transform 0.1s ease' },
  
  // 📱 Fixed touch physics configurations
  scrollableContentWrapper: { display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
  mainWorkspaceLayout: { display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: '16px', boxSizing: 'border-box', background: 'linear-gradient(180deg, #121212 0%, #000000 100%)' },
  dashboardContainer: { display: 'flex', flexDirection: 'row', gap: '24px', width: '100%', maxWidth: '950px', justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' },
  slideColumn: { flex: '1', maxWidth: '385px', minWidth: '280px', width: '100%' },
  plannerColumn: { flex: '1', maxWidth: '480px', minWidth: '280px', width: '100%' },
  
  spotifyFooterSection: { textAlign: 'center', padding: '32px 16px', background: '#000', borderTop: '1px solid #121212', boxSizing: 'border-box' },
  footerPrimaryText: { margin: 0, color: '#b3b3b3', fontSize: '0.75rem', fontWeight: '400' },
  footerSecondaryText: { margin: '8px 0 0 0', color: '#535353', fontSize: '0.65rem', lineHeight: '1.4' }
};

const plannerStyles = {
  panel: { background: '#121212', borderRadius: '8px', padding: '16px', width: '100%', boxSizing: 'border-box' },
  bannerHeader: { display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '16px', paddingBottom: '8px' },
  playlistCoverPlaceholder: { width: '80px', height: '80px', background: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
  bannerTextColumn: { display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' },
  badgeLabel: { fontSize: '0.65rem', fontWeight: '700', letterSpacing: '0.8px', color: '#fff', marginBottom: '4px' },
  titleInput: { background: 'transparent', border: 'none', color: '#fff', fontSize: '1.75rem', fontWeight: '700', letterSpacing: '-0.5px', outline: 'none', padding: '0', width: '100%', textOverflow: 'ellipsis', fontFamily: 'inherit' },
  bannerMeta: { color: '#b3b3b3', fontSize: '0.78rem', marginTop: '4px', fontWeight: '400' },
  actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' },
  spotifyPlayBtn: { display: 'inline-flex', alignItems: 'center', background: '#1ED760', color: '#000', border: 'none', padding: '8px 24px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'transform 0.1s ease', fontFamily: 'inherit' },
  filterControls: { display: 'flex', gap: '8px' },
  spotifySelect: { background: '#282828', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' },
  spotifySelectCompact: { background: '#282828', border: 'none', color: '#fff', padding: '8px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' },
  tableHeaderGrid: { display: 'flex', padding: '0 12px 8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#b3b3b3', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px' },
  trackContainerStack: { display: 'flex', flexDirection: 'column', height: '240px', overflowY: 'auto', marginTop: '4px' },
  trackRowItem: { display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: '4px', transition: 'background-color 0.2s' },
  rowNumber: { width: '40px', textAlign: 'left', color: '#b3b3b3', fontSize: '0.85rem', paddingLeft: '8px' },
  rowMetaDetails: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  trackTitleText: { color: '#fff', fontSize: '0.88rem', fontWeight: '400', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  trackArtistText: { color: '#b3b3b3', fontSize: '0.78rem', margin: 0, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  emptyMsgText: { color: '#b3b3b3', fontSize: '0.78rem', padding: '48px 16px', textAlign: 'center' }
};