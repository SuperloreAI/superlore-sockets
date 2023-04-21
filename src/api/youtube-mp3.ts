import YoutubeMp3Downloader from "youtube-mp3-downloader";
import youtubeDl from "youtube-dl-exec";
import { initStorage, uploadToGCS } from "@/lib/storage";
import { extractYouTubeVideoId } from "@/lib/helpers/url";
import path from "path";
import fs from "fs";
import { getOperatingSystem } from "@/lib/helpers/os";
import { getAudioMetadata } from "@/lib/helpers/metadata-video";
import {
  MediaUpdateInterchangeAudioCreate,
  placeholderAudioThumbnail,
} from "@superlore/helpers";

interface ExtractYouTubeAudioOptions {
  url: string;
  assetIDAudio: string;
  assetAudioName: string;
}
export const extractYouTubeAudio = async (
  args: ExtractYouTubeAudioOptions
): Promise<MediaUpdateInterchangeAudioCreate> => {
  return new Promise(async (resolve, reject) => {
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

    const videoInfo = await youtubeDl(youtubeId, {
      noCheckCertificates: true,
      dumpSingleJson: true,
    });
    console.log(videoInfo.title);
    const videoTitle = videoInfo.title;

    YD.on("finished", async (err: Error, data: any) => {
      console.log(JSON.stringify(data));

      const localFilePath = data.file;

      console.log(`
      
      localFilePath=${localFilePath}
      outputFilePath=${outputFilePath}
      
      `);

      const metadata = await getAudioMetadata(localFilePath);

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
          const compiled = {
            id: assetIDAudio,
            title: videoTitle,
            notes: "",
            url,
            thumbnail: placeholderAudioThumbnail,
            metadata,
          };
          resolve(compiled);
        }
      });
    });

    YD.on("error", (error: Error) => {
      console.log(error);
      throw Error(error.message);
    });

    YD.on("progress", (progress: any) => {
      console.log(JSON.stringify(progress));
    });
  });
};
