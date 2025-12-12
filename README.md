# 🎵 TSTimer: The Taylor Swift Playlist Generator

**TSTimer** is a full-stack web application that generates custom Spotify playlists consisting exclusively of Taylor Swift songs. Unlike standard shuffles, this tool curates a playlist to match a **specific duration** requested by the user.

> *Need a 20-minute playlist for a quick run? Or a 3-hour playlist for a road trip? TSTimer builds it for you using the Spotify API.*

## 🚀 Features

* **Time-Based Curation:** Algorithms select tracks to approximate the user's desired playlist length.
* **Spotify Integration:** Seamless authentication and playlist creation directly to the user's Spotify account.
* **Customizable Source:** While currently optimized for Taylor Swift, the source pool can be modified to support any artist or genre.

## 🛠️ Tech Stack

* **Frontend:** React (Vite)
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **API:** Spotify Web API

---

## ⚙️ Installation & Setup

Prerequisites: Node.js installed and a [Spotify Developer](https://developer.spotify.com/dashboard) account.

### 1. Clone the Repository
```bash
git clone https://github.com/poisonrous/TSTimer.git
cd TSTimer
```

### 2. Backend Setup
Navigate to the backend folder, install dependencies, and configure environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following keys:

```ini
# Server Configuration
ALLOWED_ORIGINS=http://localhost:5173  # URL of your frontend
FRONTEND_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_production_secret_here

# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5000/api/callback # Update based on your auth route

# Source Playlist (Taylor Swift or anyone you like!)
SPOTIFY_PLAYLIST_ID=your_source_playlist_id
```

Start the backend server:
```bash
node index.js
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and configure the environment.

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```ini
VITE_SERVER_URL=http://localhost:5000 # URL where your backend is running
```

Start the development server:
```bash
npm run dev
```

---

## 🧩 How It Works

1.  **Data Fetching:** The backend fetches tracks from the `SPOTIFY_PLAYLIST_ID` source.
2.  **Algorithm:** The application selects songs from the source pool to match the user's input time limit as closely as possible without exceeding it (or using a "best fit" approach).
3.  **Authentication:** The app authenticates the user via Spotify OAuth.
4.  **Creation:** A new private playlist is created in the user's Spotify account.

---

*Developed by poisonrous*