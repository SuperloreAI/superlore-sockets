import youtubeDl from "youtube-dl-exec";
import { initStorage, uploadToGCS } from "@/lib/storage";
import path from "path";
import { extractYouTubeVideoId } from "@/lib/helpers/url";
import fs from "fs";
import { extractRandomScreenshot } from "@/lib/helpers/thumbnail";
import { getVideoMetadata } from "@/lib/helpers/metadata-video";
import { MediaUpdateInterchangeVideoCreate } from "@superlore/helpers";

interface ExtractYouTubeVideoOptions {
  url: string;
  assetIDVideo: string;
  assetVideoName: string;
}
export const extractYouTubeVideo = async (
  args: ExtractYouTubeVideoOptions
): Promise<MediaUpdateInterchangeVideoCreate> => {
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
  console.log(`__________________________ 0`);
  console.log(`outputFilePath=${outputFilePath}`);
  try {
    await youtubeDl(youtubeId, {
      format: "mp4",
      output: outputFilePath,
      noCheckCertificates: true,
    });
    const videoInfo = await youtubeDl(youtubeId, {
      noCheckCertificates: true,
      dumpSingleJson: true,
    });
    console.log(videoInfo.title);
    console.log(`=============================`);

    // Extract title and description
    const videoTitle = videoInfo.title;
    const videoDesc = videoInfo.description;

    console.log(`__________________________ 1`);
    const localFilePath = outputFilePath;
    const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";

    console.log(`__________________________ 2`);
    // Create a thumbnail
    const thumbnailPath = await extractRandomScreenshot(
      localFilePath,
      assetIDVideo
    );
    console.log(`finished getting thumbnail`);
    console.log(`__________________________ 3`);

    // Get the metadata
    const metadata = await getVideoMetadata(localFilePath);
    console.log(`got metadata`);

    const [videoUrl, thumbnailUr] = await Promise.all([
      uploadToGCS(storage, localFilePath, bucketName, assetVideoName),
      uploadToGCS(
        storage,
        thumbnailPath.localPath,
        bucketName,
        thumbnailPath.fileName
      ),
    ]);
    console.log(`File has been uploaded to ${url}`);

    // Delete the local file after upload
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error(`Error deleting local file: ${err.message}`);
      } else {
        console.log(`Local file '${localFilePath}' has been deleted.`);
      }
    });

    // Delete the local thumbnail after upload
    fs.unlink(thumbnailPath.localPath, (err) => {
      if (err) {
        console.error(`Error deleting local file: ${err.message}`);
      } else {
        console.log(`Local file '${thumbnailPath}' has been deleted.`);
      }
    });

    return {
      id: assetIDVideo,
      thumbnail: thumbnailUr,
      title: videoTitle,
      notes: videoDesc,
      url: videoUrl,
      metadata,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
