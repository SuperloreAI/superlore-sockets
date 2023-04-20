import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuid } from "uuid";
import { extractYouTubeVideo } from "@/api/youtube-mp4";
import { extractYouTubeAudio } from "@/api/youtube-mp3";
import { extractTikTokVideo } from "@/api/tiktok-mp4";
import { clipAndUploadVideo } from "@/api/video-clipper";
import { clipAndUploadAudio } from "@/api/audio-clipper";
import { updateVideoStatus } from "@/api/update-database";
dotenv.config();

const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;

const corsOptions = {
  origin: FRONTEND_DOMAIN,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Websockets for Superlore");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.post("/extractor/tiktok/video", async (req, res) => {
  const { url } = req.body;
  const assetIDVideo = uuid();
  const assetIDAudio = uuid();
  const assetVideoName = `video-${assetIDVideo}.mp4`;
  const assetAudioName = `audio-${assetIDAudio}.mp3`;
  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";

  const expectedFinalVideoPath = `https://storage.googleapis.com/${bucketName}/${assetVideoName}`;
  const expectedFinalAudioPath = `https://storage.googleapis.com/${bucketName}/${assetAudioName}`;
  try {
    extractTikTokVideo({
      url,
      assetIDVideo,
      assetIDAudio,
      assetVideoName,
      assetAudioName,
    });
    res.status(200).json({
      video: {
        url: expectedFinalVideoPath,
        id: assetIDVideo,
      },
      audio: {
        url: expectedFinalAudioPath,
        id: assetIDAudio,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

app.post("/extractor/youtube/video", async (req, res) => {
  const { url } = req.body;
  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";
  const assetIDVideo = uuid();
  const assetVideoName = `video-${assetIDVideo}.mp4`;
  const expectedFinalVideoPath = `https://storage.googleapis.com/${bucketName}/${assetVideoName}`;
  try {
    extractYouTubeVideo({
      url,
      assetIDVideo,
      assetVideoName,
    });
    res.status(200).json({
      url: expectedFinalVideoPath,
      id: assetIDVideo,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

app.post("/extractor/youtube/audio", async (req, res) => {
  const { url } = req.body;
  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";
  const assetIDAudio = uuid();
  const assetAudioName = `audio-${assetIDAudio}.mp3`;
  const expectedFinalAudioPath = `https://storage.googleapis.com/${bucketName}/${assetAudioName}`;
  try {
    extractYouTubeAudio({
      url,
      assetIDAudio,
      assetAudioName,
    });
    res.status(200).json({
      url: expectedFinalAudioPath,
      id: assetIDAudio,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

app.post("/clipper/video", async (req, res) => {
  const { url, startTime, endTime } = req.body;
  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";
  const assetIDVideo = uuid();
  const assetVideoName = `video-${assetIDVideo}.mp4`;
  const expectedFinalVideoPath = `https://storage.googleapis.com/${bucketName}/${assetVideoName}`;
  try {
    clipAndUploadVideo({
      url,
      startTime,
      endTime,
      assetVideoName,
      assetIDVideo,
    })
      .then(updateVideoStatus)
      .catch((err) => console.log(err));
    res.status(200).json({
      url: expectedFinalVideoPath,
      id: assetIDVideo,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

app.post("/clipper/audio", async (req, res) => {
  const { url, startTime, endTime, outputFileName } = req.body;
  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";
  const assetIDAudio = uuid();
  const assetAudioName = `audio-${assetIDAudio}.mp3`;
  const expectedFinalAudioPath = `https://storage.googleapis.com/${bucketName}/${assetAudioName}`;
  try {
    clipAndUploadAudio({
      url,
      startTime,
      endTime,
      assetAudioName,
      assetIDAudio,
    });
    res.status(200).json({
      url: expectedFinalAudioPath,
      id: assetIDAudio,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
