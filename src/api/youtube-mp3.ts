import YoutubeMp3Downloader from "youtube-mp3-downloader";
import { initStorage, uploadToGCS } from "@/lib/storage";
import { extractYouTubeVideoId } from "@/lib/helpers/url";
import path from "path";
import fs from "fs";
import { getOperatingSystem } from "@/lib/helpers/os";

interface ExtractYouTubeAudioOptions {
  url: string;
  assetIDAudio: string;
  assetAudioName: string;
}
export const extractYouTubeAudio = async (args: ExtractYouTubeAudioOptions) => {
  const { assetIDAudio, url, assetAudioName } = args;
  const youtubeId = extractYouTubeVideoId(url);
  if (!youtubeId) {
    throw Error("Invalid YouTube URL");
  }

  const storage = await initStorage();

  const outputFilePath = path.join(
    __dirname, // Add this line to make the path relative to the current directory
    "../../assets"
  );

  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";

  const defaultFfmpegPath =
    getOperatingSystem() === "linux"
      ? "/usr/bin/ffmpeg"
      : "/usr/local/bin/ffmpeg"; // "/usr/bin/ffmpeg" is default location on linux systems, "/usr/local/bin/ffmpeg" on mac
  const YD = new YoutubeMp3Downloader({
    ffmpegPath: defaultFfmpegPath, // defaultFfmpegPath,
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

    const url = await uploadToGCS(
      storage,
      localFilePath,
      bucketName,
      assetAudioName
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
