# 🎵 Spotify Wrapped Hub & Smart Playlist Planner

A full-stack Spotify analytics dashboard built with **React (Vite)**, **Node.js (Express)**, and the **Spotify Web API**. The application allows users to upload their exported Spotify streaming history, analyze their listening habits, generate Spotify Wrapped-style insights, and create personalized playlists.

---

## ✨ Features

### 🎬 Wrapped-Style Stories

Generate an interactive slide deck inspired by Spotify Wrapped, featuring:

* Top Songs
* Top Artists
* Top Genres
* Listening Time Statistics
* Listening Personality
* Achievement Milestones

### 🎵 Live Spotify Metadata

Connects to the Spotify Web API to retrieve:

* Album Artwork
* Artist Images
* Track Information
* Genre Data

### 📊 Advanced Analytics

Analyze listening behavior including:

* Total Listening Time
* Most Played Songs
* Most Played Artists
* Listening Activity by Time of Day
* Monthly Listening Trends
* Top 5 Rankings

### 🏆 Achievement System

Unlock milestones based on listening habits, such as:

* Music Explorer
* Weekend Listener
* Night Owl
* Top Artist Fan

### 🎧 Smart Playlist Planner

Create custom playlists from your listening history and export them as standard `.m3u` playlist files.

### 📸 Social Sharing

Capture and download high-resolution images of your Wrapped slides using `html2canvas`.

---

## 🏗️ Project Structure

```text
spotify-wrapped-hub/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   └── App.jsx
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
│
└── README.md
```

### Frontend (`/client`)

Built with:

* React
* Vite
* Framer Motion
* Recharts
* html2canvas

### Backend (`/server`)

Built with:

* Node.js
* Express
* Multer
* Axios
* CORS

---

## 🛠️ Installation & Setup

### 1. Prerequisites

Install the following:

* Node.js (v18 or later)
* npm
* Spotify Developer Account

---

### 2. Configure Spotify API Credentials

1. Visit the Spotify Developer Dashboard.
2. Create a new application.
3. Configure the Redirect URI:

```text
http://127.0.0.1:5000/callback
```

4. Open `server/server.js` and add your credentials:

```javascript
const SPOTIFY_CLIENT_ID = "YOUR_CLIENT_ID";
const SPOTIFY_CLIENT_SECRET = "YOUR_CLIENT_SECRET";
```

---

### 3. Start the Backend Server

```bash
cd server
npm install
node server.js
```

Backend will run on:

```text
http://localhost:5000
```

---

### 4. Start the Frontend Application

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Vite will display a local URL, typically:

```text
http://localhost:5173
```

Open that URL in your browser.

---

## 📥 Getting Your Spotify Streaming History

### Request Your Data

1. Log in to Spotify.
2. Open **Account Settings**.
3. Navigate to **Privacy Settings**.
4. Request your **Extended Streaming History**.
5. Spotify will email you a download link once your data is ready.

### Import Your Data

After downloading:

1. Extract the ZIP file.
2. Locate files such as:

```text
StreamingHistory_music_0.json
StreamingHistory_music_1.json
```

3. Upload the JSON file through the application's upload page.

The system will automatically analyze your listening history and generate your Wrapped report.

---

## 📊 Analytics Generated

The application can calculate:

* Total Listening Hours
* Top Songs
* Top Artists
* Top Genres
* Listening Activity by Hour
* Listening Activity by Month
* Most Played Track
* Favorite Listening Period
* Listening Personality

---

## 🧰 Technology Stack

### Frontend

* React.js
* Vite
* Framer Motion
* Recharts
* html2canvas

### Backend

* Node.js
* Express.js
* Axios
* Multer
* CORS

### API Integration

* Spotify Web API
* Spotify Accounts API

---

## 🚀 Future Improvements

* User Authentication
* Multiple-Year Wrapped Comparison
* Playlist Recommendations
* AI-Generated Listening Insights
* PDF Export
* Public Share Links
* Dark/Light Theme Support

---

## 📄 License

This project is for educational and personal use.

Spotify and Spotify Wrapped are trademarks of Spotify Technology S.A. This project is not affiliated with, endorsed by, or sponsored by Spotify.
