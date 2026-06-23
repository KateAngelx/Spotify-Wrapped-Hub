require('dotenv').config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
    ? 'https://spotify-wrapped-hub.vercel.app/callback' 
    : 'http://localhost:5173/callback';

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: ['https://spotify-wrapped-hub.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Helper: Get Base Client Credentials Token
async function getSpotifyAccessToken() {
    try {
        const params = new URLSearchParams({ grant_type: 'client_credentials' });
        const res = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return res.data.access_token;
    } catch (err) {
        console.error('⚠️ Base Auth Token Error:', err.message);
        return null;
    }
}

// Helper: Query Spotify Meta API
async function fetchSpotifyMeta(query, token, type = 'track') {
    if (!token) return null;
    try {
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=1`;
        const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        
        if (type === 'track' && res.data.tracks?.items?.[0]) {
            const track = res.data.tracks.items[0];
            return { image: track.album?.images?.[0]?.url, previewUrl: track.preview_url };
        }
        if (type === 'artist' && res.data.artists?.items?.[0]) {
            const artist = res.data.artists.items[0];
            return { image: artist.images?.[0]?.url, genres: artist.genres };
        }
    } catch (e) { 
        return null; 
    }
    return null;
}

// Smart Taste Classifier & Persona Text Randomizer Engine
function computeMusicalPersona(artistCounts, genreCounts) {
    let topGenre = "POP";
    let maxCount = 0;
    
    Object.entries(genreCounts).forEach(([genre, count]) => {
        if (count > maxCount) {
            maxCount = count;
            topGenre = genre;
        }
    });

    let persona = "MAINSTREAM_POP";
    if (topGenre.includes("ROCK") || topGenre.includes("METAL") || topGenre.includes("PUNK")) {
        persona = "HEAVY_ROCK";
    } else if (topGenre.includes("LO-FI") || topGenre.includes("AMBIENT") || topGenre.includes("CHILL") || topGenre.includes("CLASSICAL")) {
        persona = "AMBIENT_FOCUS";
    }

    // Dynamic Choice Text Arrays loaded into code
    const scripts = {
        MAINSTREAM_POP: [
            "You didn't just follow the trends this year—you set them.",
            "Your soundtrack lived directly on the global main stage.",
            "High energy, peak production, and zero skips."
        ],
        HEAVY_ROCK: [
            "Your eardrums survived a beautiful acoustic assault.",
            "Maximum distortion. Deep riffs. Zero regrets.",
            "You prefer your audio raw, heavy, and unapologetically loud."
        ],
        AMBIENT_FOCUS: [
            "You kept your head down and your frequencies low.",
            "The official background score of your productivity streaks.",
            "Elegant soundscapes that turned chaos into absolute focus."
        ]
    };

    const targetPool = scripts[persona];
    const pickedText = targetPool[Math.floor(Math.random() * targetPool.length)];

    return { persona, description: pickedText };
}

// Central Data Processing Core Engine
async function processSpotifyData(rawData) {
    let totalMs = 0;
    const artistCounts = {};
    const trackCounts = {};
    const genreCounts = {};
    const monthlyMins = Array(12).fill(0);
    let morningHours = 0, afternoonHours = 0, eveningHours = 0, nightHours = 0;

    rawData.forEach(item => {
        const ms = item.msPlayed || item.ms_played || 0;
        totalMs += ms;

        const timestamp = item.ts || item.endTime;
        if (timestamp) {
            const date = new Date(timestamp);
            if (!isNaN(date.getMonth())) {
                monthlyMins[date.getMonth()] += Math.round(ms / 60000);
            }
            const hour = date.getHours();
            if (!isNaN(hour)) {
                if (hour >= 6 && hour < 12) morningHours += ms;
                else if (hour >= 12 && hour < 17) afternoonHours += ms;
                else if (hour >= 17 && hour < 22) eveningHours += ms;
                else nightHours += ms;
            }
        }

        const artist = item.artistName || item.master_metadata_album_artist;
        if (artist) artistCounts[artist] = (artistCounts[artist] || 0) + 1;

        const track = item.trackName || item.master_metadata_track_name;
        if (track && artist) {
            const trackKey = `${track} by ${artist}`;
            trackCounts[trackKey] = (trackCounts[trackKey] || 0) + 1;
        }
    });

    const totalMinutes = Math.round(totalMs / 60000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const timelineData = months.map((m, idx) => ({ name: m, mins: monthlyMins[idx] || 0 }));

    const slots = [morningHours, afternoonHours, eveningHours, nightHours];
    const maxSlot = Math.max(...slots);
    let timePersonality = "Night Owl";
    if (maxSlot === morningHours) timePersonality = "Early Bird";
    else if (maxSlot === afternoonHours) timePersonality = "Day Driver";
    else if (maxSlot === eveningHours) timePersonality = "Sunset Chaser";

    let topArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(a => ({ name: a[0], plays: a[1] }));
    let topTracks = Object.entries(trackCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(t => ({ name: t[0], plays: t[1] }));

    let topTrackAudioPreview = null;
    const token = await getSpotifyAccessToken();

    if (token) {
        if (topTracks.length > 0) {
            const meta = await fetchSpotifyMeta(topTracks[0].name, token, 'track');
            if (meta) {
                topTracks[0].image = meta.image;
                topTrackAudioPreview = meta.previewUrl;
            }
        }
        for (let i = 0; i < topArtists.length; i++) {
            const meta = await fetchSpotifyMeta(topArtists[i].name, token, 'artist');
            if (meta) {
                topArtists[i].image = meta.image;
                if (meta.genres && meta.genres.length > 0) {
                    meta.genres.forEach(g => {
                        const formattedGenre = g.toUpperCase();
                        genreCounts[formattedGenre] = (genreCounts[formattedGenre] || 0) + 20;
                    });
                }
            }
        }
    }

    if (Object.keys(genreCounts).length === 0) {
        genreCounts['POP & DANCE'] = 45; genreCounts['ROCK'] = 35; genreCounts['HIP HOP'] = 20;
    }
    
    const genreData = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, value]) => ({ name, value }));
    const personaMetrics = computeMusicalPersona(artistCounts, genreCounts);

    return { 
        totalMinutes, topArtists, topTracks, timelineData, genreData, timePersonality, 
        topTrackAudioPreview, persona: personaMetrics.persona, personaText: personaMetrics.description 
    };
}

// ROUTE 1: Traditional Raw File Uploader Endpoint
app.post('/api/upload', upload.single('spotifyData'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
        const filePath = req.file.path;
        const fileData = fs.readFileSync(filePath, 'utf8');
        const analyticsResult = await processSpotifyData(JSON.parse(fileData));
        fs.unlinkSync(filePath);
        res.json(analyticsResult);
    } catch (error) {
        res.status(500).json({ error: 'Processing error.' });
    }
});

// ROUTE 2: Auto-Generate Simulated Live Demo Sandbox Workspace
app.get('/api/demo', async (req, res) => {
    try {
        const mockHistory = [];
        const artists = ['The Weeknd', 'Daft Punk', 'Billie Eilish', 'Radiohead', 'Hans Zimmer'];
        const tracks = ['Blinding Lights', 'One More Time', 'Bad Guy', 'Creep', 'Time'];
        
        // Populate 200 random tracking streams across a simulated timeline
        for (let i = 0; i < 200; i++) {
            const randomIndex = Math.floor(Math.random() * artists.length);
            mockHistory.push({
                msPlayed: Math.floor(Math.random() * 180000) + 60000,
                ts: new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
                artistName: artists[randomIndex],
                trackName: tracks[randomIndex]
            });
        }
        const analyticsResult = await processSpotifyData(mockHistory);
        res.json(analyticsResult);
    } catch (error) {
        res.status(500).json({ error: 'Demo generation failed.' });
    }
});

// ROUTE 3: Spotify Live Account Authentication Redirect Gateway Link
app.get('/api/login', (req, res) => {
    const scope = 'user-top-read';
    const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI
    }).toString();
    res.json({ url: spotifyAuthUrl });
});

// ROUTE 4: Spotify Auth Handshake Callback Listener
app.get('/api/callback', async (req, res) => {
    const code = req.query.code || null;
    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }).toString(), {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const userToken = tokenResponse.data.access_token;
        
        // Query user's real live top 50 songs straight from Spotify
        const topTracksRes = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50', {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        const mappedHistory = topTracksRes.data.items.map(track => ({
            msPlayed: 180000, // Normalized default streaming weight
            ts: new Date().toISOString(),
            artistName: track.artists[0].name,
            trackName: track.name
        }));

        const analyticsResult = await processSpotifyData(mappedHistory);
        res.json(analyticsResult);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Authentication pipeline tracking error.');
    }
});

app.listen(PORT, () => console.log(`Upgraded Production Engine Active on Port ${PORT}`));