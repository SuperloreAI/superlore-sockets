import YoutubeMp3Downloader from "youtube-mp3-downloader";
import { initStorage, uploadToGCS } from "@/lib/storage";
import { extractYouTubeVideoId } from "@/lib/helpers/url";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

interface ExtractYouTubeAudioOptions {
  url: string;
}
export const extractYouTubeAudio = async ({
  url,
}: ExtractYouTubeAudioOptions) => {
  console.log("extracting youtube audio");
  console.log(url);
  const youtubeId = extractYouTubeVideoId(url);
  if (!youtubeId) {
    throw Error("Invalid YouTube URL");
  }

  const storage = await initStorage();

  const id = uuid();
  const outputFilePath = path.join(
    __dirname, // Add this line to make the path relative to the current directory
    "../../assets"
  );
  console.log(`outputFilePath===`);
  console.log(outputFilePath);

  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";

  const defaultFfmpegPath = "/usr/bin/ffmpeg" || "/usr/local/bin/ffmpeg"; // "/usr/bin/ffmpeg" is default location on linux systems, "/usr/local/bin/ffmpeg" on mac
  const YD = new YoutubeMp3Downloader({
    ffmpegPath: defaultFfmpegPath,
    outputPath: outputFilePath,
    youtubeVideoQuality: "highestaudio",
    queueParallelism: 2,
    progressTimeout: 2000,
    allowWebm: false,
  });

  YD.download(youtubeId);

  YD.on("finished", async (err: Error, data: any) => {
    console.log(JSON.stringify(data));

    const localFilePath = data.file;
    const remoteFilePath = `${data.videoId}-${id}.mp3`;

    const url = await uploadToGCS(
      storage,
      localFilePath,
      bucketName,
      remoteFilePath
    );
    console.log(`File has been uploaded to ${url}`);
    // Delete the local file after upload
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error(`Error deleting local file: ${err.message}`);
      } else {
        console.log(`Local file '${localFilePath}' has been deleted.`);
      }
    });
    return url;
  });

  YD.on("error", (error: Error) => {
    console.log(error);
    throw Error(error.message);
  });

  YD.on("progress", (progress: any) => {
    console.log(JSON.stringify(progress));
  });
};
