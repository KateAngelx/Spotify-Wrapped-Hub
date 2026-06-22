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

  // --- SAFE DATA FALLBACKS TO PREVENT BLACK SCREEN CRASHES ---
  const topTracks = data?.topTracks || [];
  const topArtists = data?.topArtists || [];
  const timelineData = data?.timelineData || [];
  const genreData = data?.genreData || [];
  const badges = data?.badges || [];
  const timePersonality = data?.timePersonality || "Night Owl";
  const totalMinutes = data?.totalMinutes || 0;
  const totalHours = Math.round(totalMinutes / 60);

  useEffect(() => {
    if (data?.topTrackAudioPreview && audioRef.current) {
      if (currentSlide === 3) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log("Audio waiting for interaction:", err));
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

  const getTimeMachineBackground = () => {
    if (timePersonality === "Night Owl") return 'linear-gradient(180deg, #180030 0%, #05000d 100%)';
    if (timePersonality === "Early Bird") return 'linear-gradient(180deg, #ff8c00 0%, #ff0055 100%)';
    if (timePersonality === "Sunset Chaser") return 'linear-gradient(180deg, #501396 0%, #ab1439 100%)';
    return 'linear-gradient(180deg, #0d543a 0%, #051a12 100%)';
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
      background: 'linear-gradient(180deg, #320662 0%, #07010f 100%)',
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>2026 WRAPPED</h2>
          <h1 style={styles.heroText}>Your year in sound was entirely unique.</h1>
          <p style={styles.subTag}>Let's look back at the beats that defined you.</p>
        </div>
      )
    },
    {
      id: 'minutes',
      background: 'linear-gradient(180deg, #0e4c3a 0%, #03110d 100%)',
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>THE INVESTMENT</h2>
          <h1 style={styles.heroText}>You let the tracks roll all year long.</h1>
          <div style={styles.bigStatContainer}>
            <span style={styles.statNumber}>{totalMinutes}</span>
            <span style={styles.statLabel}>MINUTES LISTENED</span>
          </div>
          <p style={styles.subText}>That's roughly {totalHours} full hours of audio runtime.</p>
        </div>
      )
    },
    {
      id: 'time-machine',
      background: getTimeMachineBackground(),
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>🕒 TIME MACHINE ANALYSIS</h2>
          <h1 style={{...styles.heroText, fontSize: '1.4rem', color: '#fff', marginBottom: '15px'}}>Your Peak Energy Slot</h1>
          <h1 style={{...styles.heroText, fontSize: '3rem', color: '#1ED760'}}>{timePersonality}</h1>
          <p style={styles.subText}>Your playback velocity surged dramatically during this zone of the day.</p>
        </div>
      )
    },
    {
      id: 'top-song',
      background: 'linear-gradient(180deg, #7c0b2b 0%, #160105 100%)',
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>YOUR ABSOLUTE ANTHEM</h2>
          <div style={styles.albumArtFrame}>
            <img src={topTracks[0]?.image || getVisualMedia(topTracks[0]?.name || '', 'track')} alt="Album Cover" style={styles.albumArtImage} />
            <div style={styles.albumBadge}>#1</div>
            {data?.topTrackAudioPreview && (
              <button onClick={togglePlaybackState} style={styles.audioBubbleBtn}>
                {isPlaying ? '⏸️' : '▶️'}
              </button>
            )}
          </div>
          <h1 style={{...styles.heroText, fontSize: '1.9rem', marginTop: '20px'}}>{topTracks[0]?.name?.split(' by ')[0] || 'Unknown Track'}</h1>
          <p style={styles.artistSubline}>{topTracks[0]?.name?.split(' by ')[1] || 'Unknown Artist'}</p>
        </div>
      )
    },
    {
      id: 'top-artist',
      background: 'linear-gradient(180deg, #0a4054 0%, #010a0d 100%)',
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>CREATIVE SYNC</h2>
          <div style={styles.artistCircleFrame}>
            <img src={topArtists[0]?.image || getVisualMedia(topArtists[0]?.name || '', 'artist')} alt="Artist Portrait" style={styles.artistCircleImage} />
          </div>
          <p style={{...styles.tagline, color: '#1ED760', marginTop: '20px'}}>YOUR TOP ARTIST</p>
          <h1 style={{...styles.heroText, fontSize: '2.5rem'}}>{topArtists[0]?.name || 'Unknown Artist'}</h1>
        </div>
      )
    },
    {
      id: 'timeline-chart-slide',
      background: 'linear-gradient(180deg, #1b3a4b 0%, #061118 100%)',
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>STREAMING DENSITY WAVE</h2>
          <h1 style={{...styles.heroText, fontSize: '1.6rem', marginBottom: '15px'}}>Monthly Overview</h1>
          <div style={{ width: '100%', height: '210px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ left: -20, right: 10 }}>
                <XAxis dataKey="name" stroke="#b3b3b3" tickLine={false} style={{fontSize: '0.75rem'}} />
                <YAxis stroke="#b3b3b3" tickLine={false} style={{fontSize: '0.75rem'}} />
                <Tooltip contentStyle={{background: '#181818', color: '#fff', borderRadius: '8px'}} />
                <Area type="monotone" dataKey="mins" stroke="#1ED760" fill="rgba(30, 215, 96, 0.2)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    },
    {
      id: 'genres',
      background: 'linear-gradient(180deg, #6d3a04 0%, #120900 100%)',
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>SOUND SCAPE REVELATION</h2>
          <h1 style={{...styles.heroText, fontSize: '1.6rem', marginBottom: '10px'}}>Your Top Genres</h1>
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
      background: 'linear-gradient(180deg, #161616 0%, #090909 100%)',
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>THE REPEAT LIST</h2>
          <h1 style={{...styles.heroText, fontSize: '1.8rem', marginBottom: '20px'}}>Your Top 5 Songs</h1>
          <div style={styles.spotifyListStack}>
            {topTracks.slice(0, 5).map((track, i) => (
              <div key={i} style={styles.spotifyRowItem}>
                <span style={styles.rowIndex}>{i + 1}</span>
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
      background: 'linear-gradient(180deg, #280854 0%, #0b0216 100%)',
      content: (
        <div style={styles.slideContent}>
          <h2 style={styles.tagline}>FREQUENT ENCOUNTERS</h2>
          <h1 style={{...styles.heroText, fontSize: '1.8rem', marginBottom: '15px'}}>Top Artists Dashboard</h1>
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
      background: '#121212',
      content: (
        <div style={styles.slideContent}>
          <h2 style={{...styles.tagline, color: '#1ED760'}}>🏆 UNLOCKED MILESTONES</h2>
          <div style={styles.badgeListStack}>
            {badges.length > 0 ? (
              badges.map((badge, idx) => (
                <div key={idx} style={styles.badgeItemCard}>
                  <span style={styles.badgeIcon}>{badge.icon}</span>
                  <div>
                    <p style={styles.badgeTitle}>{badge.title}</p>
                    <p style={styles.badgeDesc}>{badge.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.badgeItemCard}>
                <span style={styles.badgeIcon}>🚀</span>
                <div>
                  <p style={styles.badgeTitle}>Sonic Explorer</p>
                  <p style={styles.badgeDesc}>You tracked unique soundscapes this year.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'personality',
      background: '#121212',
      content: (
        <div style={styles.cardContainerBorder}>
          <h2 style={{...styles.tagline, color: '#1ED760'}}>SONIC IDENTITY</h2>
          <div style={styles.identityBadgeGraphic}>🧬</div>
          <h1 style={{...styles.heroText, fontSize: '2.2rem', color: '#fff'}}>{totalHours > 50 ? "The Devotee" : "The Connoisseur"}</h1>
          <p style={styles.personalityDescription}>
            {totalHours > 50 
              ? "Your life moves to a steady rhythm. You rely on music as an essential soundtrack for every waking hour." 
              : "You appreciate deep cuts and precise curation, savoring structural transitions that others miss."}
          </p>
        </div>
      )
    }
  ];

  return (
    <div style={styles.container}>
      {data?.topTrackAudioPreview && <audio ref={audioRef} src={data.topTrackAudioPreview} loop />}

      <div ref={captureRef} style={{width: '100%', height: '90%', borderRadius: '16px', overflow: 'hidden'}}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ ...styles.card, background: slides[currentSlide] ? slides[currentSlide].background : '#121212' }}
          >
            {slides[currentSlide] ? slides[currentSlide].content : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={styles.controls}>
        <button onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)} disabled={currentSlide === 0} style={styles.navIconBtn}>‹</button>
        <button onClick={saveCardAsImage} style={styles.shareBtn}>Download PNG</button>
        <button onClick={() => currentSlide < slides.length - 1 && setCurrentSlide(currentSlide + 1)} disabled={currentSlide === slides.length - 1} style={styles.navIconBtn}>›</button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '385px', height: '84vh' },
  card: { width: '100%', height: '100%', padding: '40px 24px 30px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.8)', position: 'relative' },
  slideContent: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  tagline: { fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '2px', color: '#B3B3B3', marginBottom: '12px', textTransform: 'uppercase' },
  subTag: { color: '#B3B3B3', fontSize: '0.95rem', marginTop: '14px', fontFamily: 'sans-serif' },
  heroText: { fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1.5px', lineHeight: '1.2', color: '#fff' },
  bigStatContainer: { marginTop: '25px', display: 'flex', flexDirection: 'column' },
  statNumber: { fontSize: '5rem', fontWeight: '900', color: '#1ED760', lineHeight: '0.95', letterSpacing: '-2px' },
  statLabel: { fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1.5px', color: '#fff', marginTop: '12px' },
  subText: { color: '#B3B3B3', fontSize: '0.85rem', marginTop: '15px' },
  albumArtFrame: { width: '190px', height: '190px', position: 'relative', borderRadius: '8px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', overflow: 'visible', marginTop: '10px' },
  albumArtImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' },
  albumBadge: { position: 'absolute', bottom: '-10px', right: '-10px', background: '#1ED760', color: '#000', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' },
  audioBubbleBtn: { position: 'absolute', top: '10px', left: '10px', background: '#1ED760', border: 'none', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
  artistSubline: { color: '#1ED760', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '6px' },
  artistCircleFrame: { width: '170px', height: '170px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.6)', border: '4px solid rgba(255,255,255,0.05)' },
  artistCircleImage: { width: '100%', height: '100%', objectFit: 'cover' },
  spotifyListStack: { display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left' },
  spotifyRowItem: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' },
  rowIndex: { fontSize: '1.1rem', fontWeight: '900', color: '#1ED760', marginRight: '15px', width: '20px', textAlign: 'center' },
  rowTitle: { fontWeight: 'bold', color: '#fff', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowSubtitle: { color: '#B3B3B3', fontSize: '0.8rem' },
  chartTooltip: { background: '#181818', borderRadius: '8px', borderColor: '#282828', color: '#fff', fontWeight: 'bold' },
  genreLegendGrid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 20px', marginTop: '15px', width: '100%' },
  legendItem: { display: 'flex', alignItems: 'center' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px' },
  legendText: { color: '#B3B3B3', fontSize: '0.85rem', fontWeight: 'bold' },
  badgeListStack: { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', textAlign: 'left' },
  badgeItemCard: { display: 'flex', alignItems: 'center', background: '#181818', padding: '12px 16px', borderRadius: '8px', border: '1px solid #282828' },
  badgeIcon: { fontSize: '2rem', marginRight: '15px' },
  badgeTitle: { fontWeight: 'bold', color: '#fff', fontSize: '1rem' },
  badgeDesc: { color: '#b3b3b3', fontSize: '0.8rem' },
  cardContainerBorder: { display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', border: '2px solid #282828', borderRadius: '12px', padding: '24px' },
  identityBadgeGraphic: { fontSize: '3.5rem', marginBottom: '10px' },
  personalityDescription: { color: '#B3B3B3', fontSize: '0.95rem', marginTop: '12px', lineHeight: '1.5', fontWeight: '500' },
  controls: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '16px', gap: '10px' },
  navIconBtn: { background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '2rem', padding: '0 10px', opacity: 0.8 },
  shareBtn: { background: '#1ED760', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }
};