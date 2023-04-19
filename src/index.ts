import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { sayHello } from "@superlore/helpers";
import { extractYouTubeVideo } from "@/api/youtube-mp4";
import { extractYouTubeAudio } from "@/api/youtube-mp3";
import { extractTikTokVideo } from "@/api/tiktok-mp4";
import { clipAndUploadVideo } from "@/api/video-clipper";
import { clipAndUploadAudio } from "@/api/audio-clipper";
dotenv.config();

const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;

console.log(`Frontend domain = ${FRONTEND_DOMAIN}`);

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
  console.log(req.body.url);
  try {
    const { video, music } = await extractTikTokVideo(req.body.url);
    console.log(video);
    console.log(music);
    res.status(200).json({
      video,
      audio: music,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

app.post("/extractor/youtube/video", async (req, res) => {
  try {
    const uploadedUrl = await extractYouTubeVideo({
      url: req.body.url,
    });
    console.log(uploadedUrl);
    res.status(200).json({
      url: uploadedUrl,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

app.post("/extractor/youtube/audio", async (req, res) => {
  try {
    const uploadedUrl = await extractYouTubeAudio({
      url: req.body.url,
    });
    console.log(uploadedUrl);
    res.status(200).json({
      url: uploadedUrl,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

app.post("/clipper/video", async (req, res) => {
  const { url, startTime, endTime, outputFileName } = req.body;
  try {
    const publicPath = await clipAndUploadVideo(
      url,
      startTime,
      endTime,
      outputFileName
    );
    console.log("Video successfully clipped and uploaded:", publicPath);
    res.status(200).json({
      url: publicPath,
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
  try {
    const publicPath = await clipAndUploadAudio(
      url,
      startTime,
      endTime,
      outputFileName
    );
    console.log("Audio successfully clipped and uploaded:", publicPath);
    res.status(200).json({
      url: publicPath,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: e,
    });
  }
});

server.listen(PORT, () => {
  sayHello();
  console.log(`listening on *:${PORT}`);
});
