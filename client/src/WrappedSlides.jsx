import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, Tooltip, AreaChart, Area } from 'recharts';
import html2canvas from 'html2canvas';

export default function WrappedSlides({ data }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const captureRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const colors = ['#1ED760', '#18D0E0', '#f43f5e', '#fbbf24', '#a855f7'];

  const topTracks = data?.topTracks || [];
  const topArtists = data?.topArtists || [];
  const timelineData = data?.timelineData || [];
  const genreData = data?.genreData || [];
  const badges = data?.badges || [];
  const timePersonality = data?.timePersonality || "Night Owl";
  const totalMinutes = data?.totalMinutes || 0;
  const totalHours = Math.round(totalMinutes / 60);

  // Read backend taste persona classification
  const userPersona = data?.persona || "MAINSTREAM_POP";
  const personaDynamicText = data?.personaText || "Your soundtrack defined a unique moment in time.";

  useEffect(() => {
    if (data?.topTrackAudioPreview && audioRef.current) {
      if (currentSlide === 3) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log("Audio awaiting interaction:", err));
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [currentSlide, data?.topTrackAudioPreview]);

  const togglePlaybackState = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const saveCardAsImage = () => {
    if (!captureRef.current) return;
    html2canvas(captureRef.current, { useCORS: true, logging: false }).then(canvas => {
      const link = document.createElement('a');
      link.download = `Wrapped_Slide_${currentSlide + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // Dynamic Layout Theme Modifier determined by Persona Taste Data
  const getThemeBackground = () => {
    if (userPersona === "HEAVY_ROCK") return 'linear-gradient(180deg, #3a0714 0%, #0d0104 100%)';
    if (userPersona === "AMBIENT_FOCUS") return 'linear-gradient(180deg, #091a36 0%, #020710 100%)';
    return 'linear-gradient(180deg, #240347 0%, #080012 100%)'; // Default Mainstream Pop gradient style
  };

  const getThemeAccentColor = () => {
    if (userPersona === "HEAVY_ROCK") return '#f43f5e';
    if (userPersona === "AMBIENT_FOCUS") return '#18D0E0';
    return '#1ED760';
  };

  const getVisualMedia = (name, type = 'artist') => {
    const searchName = name ? name.toLowerCase() : '';
    if (searchName.includes('weeknd')) return 'https://images.unsplash.com/photo-1601921004897-b7d582836990?w=400&q=80'; 
    if (searchName.includes('swift')) return 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&q=80';  
    if (searchName.includes('sheeran')) return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'; 
    return type === 'artist' 
      ? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'  
      : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80'; 
  };

  const CustomBar = (props) => {
    const { fill, x, y, width, height } = props;
    return <rect x={x} y={y} width={width} height={height} rx={6} ry={6} fill={fill} />;
  };

  const slides = [
    {
      id: 'intro',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>2026 AUDIO WRAPPED</h2>
          <h1 style={styles.heroText}>{personaDynamicText}</h1>
          <p style={styles.subTag}>Lets decipher the deep telemetry lines of your custom musical fingerprint.</p>
        </div>
      )
    },
    {
      id: 'minutes',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>TIME METRICS</h2>
          <h1 style={styles.heroText}>Your soundscape ran deep across the timeline.</h1>
          <div style={styles.bigStatContainer}>
            <span style={{...styles.statNumber, color: getThemeAccentColor()}}>{totalMinutes}</span>
            <span style={styles.statLabel}>MINUTES AGGREGATED</span>
          </div>
          <p style={styles.subText}>That translates to roughly {totalHours} absolute runtime hours.</p>
        </div>
      )
    },
    {
      id: 'time-machine',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>TEMPORAL ZONE</h2>
          <h1 style={{...styles.heroText, fontSize: '1.4rem', color: '#fff', marginBottom: '15px'}}>Peak Velocity Output</h1>
          <h1 style={{...styles.heroText, fontSize: '3rem', color: getThemeAccentColor()}}>{timePersonality}</h1>
          <p style={styles.subText}>Your listening frequency surged dynamically during this specific daily window.</p>
        </div>
      )
    },
    {
      id: 'top-song',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>CORE ANTHEM</h2>
          <div style={styles.albumArtFrame}>
            <img src={topTracks[0]?.image || getVisualMedia(topTracks[0]?.name || '', 'track')} alt="Album Cover" style={styles.albumArtImage} />
            <div style={{...styles.albumBadge, background: getThemeAccentColor()}}>1</div>
            {data?.topTrackAudioPreview && (
              <button onClick={togglePlaybackState} style={{...styles.audioBubbleBtn, background: getThemeAccentColor()}}>
                {isPlaying ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#000"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
            )}
          </div>
          <h1 style={{...styles.heroText, fontSize: '1.9rem', marginTop: '24px'}}>{topTracks[0]?.name?.split(' by ')[0] || 'Unknown Track'}</h1>
          <p style={{...styles.artistSubline, color: getThemeAccentColor()}}>{topTracks[0]?.name?.split(' by ')[1] || 'Unknown Artist'}</p>
        </div>
      )
    },
    {
      id: 'top-artist',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>CREATIVE FORCE</h2>
          <div style={styles.artistCircleFrame}>
            <img src={topArtists[0]?.image || getVisualMedia(topArtists[0]?.name || '', 'artist')} alt="Artist Portrait" style={styles.artistCircleImage} />
          </div>
          <p style={{...styles.tagline, color: getThemeAccentColor(), marginTop: '24px'}}>PRIMARY ARTIST CONTEXT</p>
          <h1 style={{...styles.heroText, fontSize: '2.5rem'}}>{topArtists[0]?.name || 'Unknown Artist'}</h1>
        </div>
      )
    },
    {
      id: 'timeline-chart-slide',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>STREAMING VELOCITY WAVE</h2>
          <h1 style={{...styles.heroText, fontSize: '1.6rem', marginBottom: '15px'}}>Chronological Data Wave</h1>
          <div style={{ width: '100%', height: '210px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ left: -20, right: 10 }}>
                <XAxis dataKey="name" stroke="#b3b3b3" tickLine={false} style={{fontSize: '0.75rem'}} />
                <YAxis stroke="#b3b3b3" tickLine={false} style={{fontSize: '0.75rem'}} />
                <Tooltip contentStyle={{background: '#181818', color: '#fff', borderRadius: '8px', border: 'none'}} />
                <Area type="monotone" dataKey="mins" stroke={getThemeAccentColor()} fill={`rgba(${userPersona === 'HEAVY_ROCK' ? '244,63,94' : '30,215,96'}, 0.15)`} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      id: 'genres',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>GENRE CLASSIFICATION</h2>
          <h1 style={{...styles.heroText, fontSize: '1.6rem', marginBottom: '10px'}}>Acoustic Mapping</h1>
          <div style={{ width: '100%', height: '220px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4}>
                  {genreData.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={styles.chartTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={styles.genreLegendGrid}>
            {genreData.map((g, i) => (
              <div key={i} style={styles.legendItem}>
                <span style={{...styles.legendDot, background: colors[i]}} />
                <span style={styles.legendText}>{g.name}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'top-5-songs',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>FREQUENT TRACK REPLAYS</h2>
          <h1 style={{...styles.heroText, fontSize: '1.8rem', marginBottom: '20px'}}>Aligned Playlist Index</h1>
          <div style={styles.spotifyListStack}>
            {topTracks.slice(0, 5).map((track, i) => (
              <div key={i} style={styles.spotifyRowItem}>
                <span style={{...styles.rowIndex, color: getThemeAccentColor()}}>{i + 1}</span>
                <div style={{flexGrow: 1, overflow: 'hidden'}}>
                  <p style={styles.rowTitle}>{track.name?.split(' by ')[0] || 'Unknown Track'}</p>
                  <p style={styles.rowSubtitle}>{track.name?.split(' by ')[1] || 'Unknown Artist'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'top-5-artists',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>DENSITY COMPARISON</h2>
          <h1 style={{...styles.heroText, fontSize: '1.8rem', marginBottom: '15px'}}>Artist Execution Count</h1>
          <div style={{ width: '100%', height: '230px', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topArtists.slice(0, 5)} layout="vertical" margin={{ left: -15, right: 15 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#B3B3B3" tickLine={false} axisLine={false} width={85} style={{ fontSize: '0.8rem', fontWeight: 'bold' }} />
                <Bar dataKey="plays" shape={<CustomBar />}>
                  {topArtists.slice(0, 5).map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      id: 'milestones-badges',
      background: getThemeBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>UNLOCKED TRACK MILESTONES</h2>
          <div style={styles.badgeListStack}>
            {badges.length > 0 ? (
              badges.map((badge, idx) => (
                <div key={idx} style={styles.badgeItemCard}>
                  <div style={{marginRight: '16px', display: 'flex', alignItems: 'center'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={getThemeAccentColor()} strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div>
                    <p style={styles.badgeTitle}>{badge.title}</p>
                    <p style={styles.badgeDesc}>{badge.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.badgeItemCard}>
                <div style={{marginRight: '16px', display: 'flex', alignItems: 'center'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={getThemeAccentColor()} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>
                </div>
                <div>
                  <p style={styles.badgeTitle}>Sonic Explorer</p>
                  <p style={styles.badgeDesc}>You tracked unique custom soundscapes throughout this system verification run.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'personality',
      background: getThemeBackground(),
      content: (
        <div style={styles.cardContainerBorder}>
          <h2 style={{...styles.tagline, color: getThemeAccentColor()}}>SONIC ARCHETYPE IDENTITY</h2>
          <div style={{marginBottom: '16px', display: 'flex', alignItems: 'center'}}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={getThemeAccentColor()} strokeWidth="1.5"><path d="M4.93 4.93a10 10 0 1114.14 14.14M12 2v4m0 12v4M2 12h4m12 0h4M5.64 5.64l2.83 2.83m7.07 7.07l2.83 2.83M18.36 5.64l-2.83 2.83m-7.07 7.07l-2.83 2.83"/></svg>
          </div>
          <h1 style={{...styles.heroText, fontSize: '2.2rem', color: '#fff'}}>{totalHours > 50 ? "The Devotee" : "The Connoisseur"}</h1>
          <p style={styles.personalityDescription}>
            {totalHours > 50 
              ? "Your life moves to a steady internal pipeline sequence. You rely on audio streaming data as a structural necessity across every execution window." 
              : "You evaluate deep cuts and precise track transitions, isolating acoustic details that default listeners overlook completely."}
          </p>
        </div>
      )
    }
  ];

  return (
    <div style={styles.container}>
      {data?.topTrackAudioPreview && <audio ref={audioRef} src={data.topTrackAudioPreview} loop />}

      <div ref={captureRef} style={styles.cardWrapper}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ ...styles.card, background: slides[currentSlide] ? slides[currentSlide].background : '#121212' }}
          >
            {/* Scrollable container for full safe mobile viewports rendering */}
            <div style={styles.mobileScrollContainer}>
              {slides[currentSlide] ? slides[currentSlide].content : null}
            </div>

            {/* Horizontal Line Progressive Segment Story Bars Tracking Element */}
            <div style={styles.progressTrackerContainer}>
              {slides.map((_, idx) => (
                <div key={idx} style={styles.progressBarTrackBase}>
                  <div style={{
                    ...styles.progressBarFillLine,
                    background: idx === currentSlide ? getThemeAccentColor() : (idx < currentSlide ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)')
                  }} />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={styles.controls}>
        <button onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)} disabled={currentSlide === 0} style={styles.navIconBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        
        {/* Compressed vector arrow download icon container button */}
        <button onClick={saveCardAsImage} style={{...styles.shareIconBtn, borderColor: getThemeAccentColor()}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={getThemeAccentColor()} strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </button>
        
        <button onClick={() => currentSlide < slides.length - 1 && setCurrentSlide(currentSlide + 1)} disabled={currentSlide === slides.length - 1} style={styles.navIconBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '385px', height: '86vh' },
  cardWrapper: { width: '100%', height: '90%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.85)' },
  card: { width: '100%', height: '100%', padding: '32px 24px 44px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' },
  mobileScrollContainer: { width: '100%', height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  slideContent: { display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '10px 0' },
  tagline: { fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '2.5px', marginBottom: '16px', textTransform: 'uppercase' },
  subTag: { color: '#B3B3B3', fontSize: '0.95rem', marginTop: '16px', lineHeight: '1.5' },
  heroText: { fontSize: '2.1rem', fontWeight: '900', letterSpacing: '-1px', lineHeight: '1.25', color: '#fff' },
  bigStatContainer: { marginTop: '28px', display: 'flex', flexDirection: 'column' },
  statNumber: { fontSize: '5rem', fontWeight: '900', lineHeight: '0.95', letterSpacing: '-2px' },
  statLabel: { fontSize: '0.72rem', fontWeight: 'bold', letterSpacing: '1.5px', color: '#fff', marginTop: '14px' },
  subText: { color: '#B3B3B3', fontSize: '0.85rem', marginTop: '16px', lineHeight: '1.4' },
  albumArtFrame: { width: '185px', height: '185px', position: 'relative', borderRadius: '12px', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', marginTop: '12px' },
  albumArtImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' },
  albumBadge: { position: 'absolute', bottom: '-10px', right: '-10px', color: '#000', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  audioBubbleBtn: { position: 'absolute', top: '10px', left: '10px', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
  artistSubline: { fontWeight: 'bold', fontSize: '1.1rem', marginTop: '8px' },
  artistCircleFrame: { width: '170px', height: '170px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.6)', border: '4px solid rgba(255,255,255,0.05)' },
  artistCircleImage: { width: '100%', height: '100%', objectFit: 'cover' },
  spotifyListStack: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left' },
  spotifyRowItem: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' },
  rowIndex: { fontSize: '1rem', fontWeight: '900', marginRight: '16px', width: '20px', textAlign: 'center' },
  rowTitle: { fontWeight: 'bold', color: '#fff', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowSubtitle: { color: '#B3B3B3', fontSize: '0.8rem', marginTop: '2px' },
  chartTooltip: { background: '#181818', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 'bold' },
  genreLegendGrid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 16px', marginTop: '16px', width: '100%' },
  legendItem: { display: 'flex', alignItems: 'center' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px' },
  legendText: { color: '#B3B3B3', fontSize: '0.8rem', fontWeight: 'bold' },
  badgeListStack: { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', textAlign: 'left' },
  badgeItemCard: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' },
  badgeTitle: { fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' },
  badgeDesc: { color: '#b3b3b3', fontSize: '0.8rem', marginTop: '2px' },
  cardContainerBorder: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' },
  personalityDescription: { color: '#B3B3B3', fontSize: '0.95rem', marginTop: '16px', lineHeight: '1.5', fontWeight: '500' },
  
  // Slide Tracking Lines Progressive Indicator Architecture Bars
  progressTrackerContainer: { position: 'absolute', bottom: '12px', left: '16px', right: '16px', display: 'flex', gap: '5px', height: '3px', zIndex: 10 },
  progressBarTrackBase: { flex: 1, height: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' },
  progressBarFillLine: { height: '100%', width: '100%', transition: 'background-color 0.3s ease' },

  controls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '14px', padding: '0 8px' },
  navIconBtn: { background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', opacity: 0.6 },
  shareIconBtn: { background: 'transparent', border: '2px solid strokeColor', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s ease' }
};