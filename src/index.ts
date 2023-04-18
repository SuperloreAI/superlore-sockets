import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { sayHello } from "@superlore/helpers";
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
app.post("/extractor/youtube/video", (req, res) => {});
app.post("/clipper/youtube", (req, res) => {});
app.post("/clipper/tiktok", (req, res) => {});

server.listen(PORT, () => {
  sayHello();
  console.log(`listening on *:${PORT}`);
});
