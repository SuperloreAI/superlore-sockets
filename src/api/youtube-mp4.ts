import youtubeDl from "youtube-dl-exec";
import { initStorage, uploadToGCS } from "@/lib/storage";
import path from "path";
import { extractYouTubeVideoId } from "@/lib/helpers/url";
import fs from "fs";

interface ExtractYouTubeVideoOptions {
  url: string;
  assetIDVideo: string;
  assetVideoName: string;
}
export const extractYouTubeVideo = async (args: ExtractYouTubeVideoOptions) => {
  const { assetIDVideo, url, assetVideoName } = args;
  const youtubeId = extractYouTubeVideoId(url);
  if (!youtubeId) {
    throw Error("Invalid YouTube URL");
  }

  const storage = await initStorage();

  const outputFilePath = path.join(
    __dirname, // Add this line to make the path relative to the current directory
    "../../assets",
    `${youtubeId}-${assetIDVideo}.mp4`
  );

  try {
    await youtubeDl(youtubeId, {
      format: "mp4",
      output: outputFilePath,
      noCheckCertificates: true,
    });

    const localFilePath = outputFilePath;
    const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";

    const url = await uploadToGCS(
      storage,
      localFilePath,
      bucketName,
      assetVideoName
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

    // Return the uploaded file path
    return url;
  } catch (error) {
    console.error(error);
  }
};
