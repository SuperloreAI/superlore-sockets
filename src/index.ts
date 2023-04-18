import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { sayHello } from "@superlore/helpers";
import { extractYouTubeVideo } from "@/api/youtube-mp4";
import { extractYouTubeAudio } from "@/api/youtube-mp3";
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

app.post("/extractor/tiktok/video", (req, res) => {});

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

app.post("/clipper/youtube", (req, res) => {});
app.post("/clipper/tiktok", (req, res) => {});

server.listen(PORT, () => {
  sayHello();
  console.log(`listening on *:${PORT}`);
});
