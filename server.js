import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3232;

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Upcoming streams
app.get("/api/upcoming", async (req, res) => {
  try {
    const hashtag = req.query.tag || "#lifeinsoulcity | #soulcity";

    const searchRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: hashtag,
          type: "video",
          eventType: "upcoming",
          maxResults: 50,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    const items = searchRes.data.items;

    // Fetch video details: statistics + liveStreamingDetails
    const videoIds = items.map((i) => i.id.videoId).join(",");
    let detailsMap = {};

    if (videoIds) {
      const detailsRes = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "liveStreamingDetails,statistics,snippet",
            id: videoIds,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );
      detailsRes.data.items.forEach((v) => {
        detailsMap[v.id] = {
          liveDetails: v.liveStreamingDetails || {},
          stats: v.statistics || {},
          snippet: v.snippet || {},
        };
      });
    }

    const now = Date.now();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

    const videos = items
      .filter((item) => {
        // Include videos with #lifeinsoulcity or #soulcity in the title or description
        const title = (item.snippet.title || "").toLowerCase();
        const desc = (item.snippet.description || "").toLowerCase();
        if (!(title.includes("#lifeinsoulcity") || desc.includes("#lifeinsoulcity") ||
          title.includes("#soulcity") || desc.includes("#soulcity"))) {
          return false;
        }

        // Remove posts where scheduled start is more than 2 days ago
        const details = detailsMap[item.id.videoId];
        const scheduledTime = details?.liveDetails?.scheduledStartTime;
        if (scheduledTime) {
          const diff = now - new Date(scheduledTime).getTime();
          if (diff > TWO_DAYS) return false;
        }

        // Remove if the stream has already gone live
        const liveStatus = details?.snippet?.liveBroadcastContent || item.snippet.liveBroadcastContent;
        if (liveStatus === "live") {
          return false;
        }

        return true;
      })
      .map((item) => {
        const details = detailsMap[item.id.videoId] || {};
        const stats = details.stats || {};
        const liveDetails = details.liveDetails || {};

        return {
          title: item.snippet.title,
          videoId: item.id.videoId,
          channel: item.snippet.channelTitle,
          thumbnail: (item.snippet.thumbnails.maxres || item.snippet.thumbnails.standard || item.snippet.thumbnails.high).url,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          scheduledStart: liveDetails.scheduledStartTime || null,
          viewers: parseInt(liveDetails.concurrentViewers || stats.viewCount || "0", 10),
          likes: parseInt(stats.likeCount || "0", 10),
          status: "upcoming",
        };
      });

    res.json(videos);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error fetching upcoming streams" });
  }
});

// Live streams (kept for future use)
app.get("/api/live", async (req, res) => {
  try {
    const hashtag = req.query.tag || "#lifeinsoulcity";

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: hashtag,
          type: "video",
          eventType: "live",
          maxResults: 10,
          order: "date",
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    const videos = response.data.items.map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      channel: item.snippet.channelTitle,
      thumbnail: (item.snippet.thumbnails.maxres || item.snippet.thumbnails.standard || item.snippet.thumbnails.high).url,
      live: true,
    }));

    res.json(videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "API Error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});
