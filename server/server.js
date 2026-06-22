require('dotenv').config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

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
        console.error('⚠️ Auth failure token generation error:', err.message);
        return null;
    }
}

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
        console.error('⚠️ Error fetching data from search endpoint:', e.message);
        return null; 
    }
    return null;
}

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
    
    const genreData = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, value]) => ({ name, value }));

    const badges = [];
    if (totalMinutes > 0) badges.push({ title: "Marathoner", desc: `Listened over ${totalMinutes} minutes!`, icon: "🏃" });
    if (topTracks.length > 0) badges.push({ title: "Obsessive Loyal", desc: `Played ${topTracks[0].name.split(' by ')[0]} repeatedly.`, icon: "🔁" });
    if (Object.keys(artistCounts).length > 2) badges.push({ title: "Sonic Explorer", desc: "Diversified with deep music catalogs.", icon: "🚀" });

    return { totalMinutes, topArtists, topTracks, timelineData, genreData, timePersonality, topTrackAudioPreview, badges };
}

app.post('/api/upload', upload.single('spotifyData'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
        const filePath = path.join(__dirname, req.file.path);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const analyticsResult = await processSpotifyData(JSON.parse(fileData));
        fs.unlinkSync(filePath);
        res.json(analyticsResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process file.' });
    }
});

app.listen(PORT, () => console.log(`🚀 Live Backend working on http://localhost:${PORT}`));