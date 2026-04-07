# SoulCity — Upcoming Streams Directory

A sleek, real-time streaming directory for the **SoulCity by EchoRP** GTA V roleplay community. Automatically fetches and displays upcoming YouTube livestreams tagged with `#lifeinsoulcity`.

**🌟 Live Demo:** [https://soulcity-schedule-stream-feature.onrender.com](https://soulcity-schedule-stream-feature.onrender.com)

![SoulCity](./public/assets/demo.jpg)

## ✨ Features

- **Live YouTube Integration** — Fetches upcoming & live streams via YouTube Data API v3
- **Auto-Filtering** — Only shows videos with `#lifeinsoulcity` in the title
- **Smart Scheduling** — Removes streams older than 2 days or already gone live
- **Responsive Grid** — Fluid layout that scales beautifully from 25% to 200% zoom
- **Premium Dark UI** — Inspired by [soulcity.live](https://soulcity.live/) with cinematic background
- **Search & Sort** — Filter streams by name, sort by date or A-Z
- **Max Quality Thumbnails** — Fetches highest available resolution (1280×720)

## 🛠 Tech Stack

| Layer        | Technology                                                        |
| ------------ | ----------------------------------------------------------------- |
| **Backend**  | Node.js + Express                                                 |
| **API**      | YouTube Data API v3                                               |
| **Frontend** | Vanilla HTML/CSS/JS                                               |
| **Font**     | [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts) |
| **Icons**    | Font Awesome 6                                                    |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [YouTube Data API v3](https://console.cloud.google.com/apis/api/youtube.googleapis.com) key

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/soulcity-streams.git
cd soulcity-streams

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your YouTube API key to .env

# Start the server
node server.js
```

Open [http://localhost:3232](http://localhost:3232) in your browser.

### Environment Variables

| Variable          | Description                  |
| ----------------- | ---------------------------- |
| `YOUTUBE_API_KEY` | Your YouTube Data API v3 key |

## 📁 Project Structure

```
yt/
├── server.js              # Express server + YouTube API endpoints
├── .env                   # API keys (not committed)
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies
└── public/
    ├── index.html         # Main HTML page
    ├── css/
    │   └── style.css      # All styles (responsive, dark theme)
    ├── js/
    │   └── app.js         # Frontend logic (fetch, render, search)
    └── assets/
        ├── bg.jpg         # Background image
        └── logo.jpg       # SoulCity logo
```

## 🔗 Links

- **SoulCity Website**: [soulcity.gg](https://soulcity.gg/)
- **Discord**: [Join Server](https://discord.com/invite/yP9s7cRgNx)
- **YouTube**: [@SoulcityGG](https://www.youtube.com/@SoulcityGG)
- **Instagram**: [@soulcitygg](https://www.instagram.com/soulcitygg)

## 📄 License

This project is for the SoulCity community. All rights reserved © 2026 SoulCity.
