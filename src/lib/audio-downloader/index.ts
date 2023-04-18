import YoutubeMp3Downloader from "youtube-mp3-downloader";
import { initStorage, uploadToGCS } from "@/lib/storage";

export const downloadAudio = async () => {
  const storage = await initStorage();

  const YD = new YoutubeMp3Downloader({
    ffmpegPath: "/path/to/ffmpeg",
    outputPath: "/path/to/mp3/folder",
    youtubeVideoQuality: "highestaudio",
    queueParallelism: 2,
    progressTimeout: 2000,
    allowWebm: false,
  });

  YD.download("Vhd6Kc4TZls");

  YD.on("finished", async (err: Error, data: any) => {
    console.log(JSON.stringify(data));

    const localFilePath = data.file;
    const bucketName = "your-bucket-name";
    const remoteFilePath = `${data.videoId}.mp3`;

    await uploadToGCS(storage, localFilePath, bucketName, remoteFilePath);
  });

  YD.on("error", (error: Error) => {
    console.log(error);
  });

  YD.on("progress", (progress: any) => {
    console.log(JSON.stringify(progress));
  });
};
