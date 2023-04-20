/**
 * How to use this file:
 * 
 * import { clipAndUploadVideo } from './videoClipper';

(async () => {
  const videoUrl = 'https://example.com/path/to/video.mp4';
  // following syntax `hh:mm:ss.milliseconds`
  const startTime = '00:01:00.00';  
  const endTime = '00:02:00.00';
  const outputFileName = 'clipped-video'; // dont include .mp4

  try {
    const publicPath = await clipAndUploadVideo(videoUrl, startTime, endTime, outputFileName);
    console.log('Video successfully clipped and uploaded:', publicPath);
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
 * 
 * 
 * 
 * POST/ http://localhost:3000/clipper/video
{
  "videoUrl": "https://storage.googleapis.com/app-backend-asset-library/e62efd65-9fa7-480c-a3cb-682c6a7f62e0.mp4",
    "startTime": "00:00:02",
    "endTime": "00:08:05",
    "outputFileName": "clipped-video"
}

 */

import { downloadFile, initStorage, uploadToGCS } from "@/lib/storage";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { extractRandomScreenshot } from "@/lib/helpers/thumbnail";
import { getVideoMetadata } from "@/lib/helpers/metadata-video";
import { MediaUpdateInterchangeVideoClip } from "@superlore/helpers/dist/types/asset-interchange";

interface ClipAndUploadVideoProps {
  url: string;
  startTime: string;
  endTime: string;
  assetIDVideo: string;
  assetVideoName: string;
}

export async function clipAndUploadVideo(
  args: ClipAndUploadVideoProps
): Promise<MediaUpdateInterchangeVideoClip> {
  const { url, startTime, endTime, assetIDVideo, assetVideoName } = args;
  console.log(`url=${url}`);
  const inputFilePathOriginal = path.join(
    __dirname, // Add this line to make the path relative to the current directory
    "../../assets",
    `${assetIDVideo}-original.mp4`
  );
  const inputFilePathClipped = path.join(
    __dirname, // Add this line to make the path relative to the current directory
    "../../assets",
    `${assetIDVideo}-clipped.mp4`
  );
  console.log(`inputFilePathOriginal=${inputFilePathOriginal}`);
  console.log(`inputFilePathClipped=${inputFilePathClipped}`);
  // Download the video file
  await downloadFile(url, inputFilePathOriginal);
  console.log(`downloaded file`);

  // Create a thumbnail
  const thumbnailPath = await extractRandomScreenshot(
    inputFilePathOriginal,
    assetIDVideo
  );
  console.log(`finished getting thumbnail`);

  // Clip the video using ffmpeg
  const outputFilePathClipped = await clipVideo(
    inputFilePathOriginal,
    inputFilePathClipped,
    startTime,
    endTime
  );
  console.log(`clipped video`);

  // Get the metadata
  const metadata = await getVideoMetadata(outputFilePathClipped);
  console.log(`got metadata`);

  const storage = await initStorage();
  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";

  console.log(`uploading to google cloud storage`);
  // Upload the clipped video to Google Cloud Storage
  const [publicPathGCP, thumbnailPathGCP] = await Promise.all([
    uploadToGCS(storage, outputFilePathClipped, bucketName, assetVideoName),
    uploadToGCS(
      storage,
      thumbnailPath.localPath,
      bucketName,
      thumbnailPath.fileName
    ),
  ]);

  // Clean up local files
  fs.unlinkSync(inputFilePathOriginal);
  fs.unlinkSync(outputFilePathClipped);
  fs.unlinkSync(thumbnailPath.localPath);

  return {
    id: assetIDVideo,
    thumbnail: thumbnailPathGCP,
    metadata,
  };
}

async function clipVideo(
  inputFilePath: string,
  outputFilePath: string,
  startTime: string,
  endTime: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .setStartTime(startTime)
      .inputOptions(`-to ${endTime}`)
      .videoCodec("libx264")
      .audioCodec("aac")
      .format("mp4")
      .output(outputFilePath)
      .on("end", () => {
        resolve(outputFilePath);
      })
      .on("error", (err: Error) => {
        console.error("ffmpeg error:", err.message);
        reject(err);
      })
      .run();
  });
}
