import { downloadFile, initStorage, uploadToGCS } from "@/lib/storage";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

interface ClipAndUploadAudioProps {
  url: string;
  startTime: string;
  endTime: string;
  assetIDAudio: string;
  assetAudioName: string;
}

export async function clipAndUploadAudio(
  args: ClipAndUploadAudioProps
): Promise<string> {
  const { url, startTime, endTime, assetIDAudio, assetAudioName } = args;
  const inputFilePathOriginal = path.join(
    __dirname,
    "../../assets",
    `${assetIDAudio}-original.mp3`
  );
  const outputFilePathTrimmed = path.join(
    __dirname,
    "../../assets",
    `${assetIDAudio}-trimmed.mp3`
  );
  console.log(`Before attempting audio download`);
  // Download the audio file
  await downloadFile(url, inputFilePathOriginal);
  console.log(`Downloaded ${url} to ${inputFilePathOriginal}`);
  // Trim the audio using ffmpeg
  const outputFilePathMp3 = await trimAudio(
    inputFilePathOriginal,
    outputFilePathTrimmed,
    startTime,
    endTime
  );
  const storage = await initStorage();
  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";

  // Upload the trimmed audio to Google Cloud Storage
  const publicPath = await uploadToGCS(
    storage,
    outputFilePathMp3,
    bucketName,
    assetAudioName
  );

  // Clean up local files
  fs.unlinkSync(inputFilePathOriginal);
  fs.unlinkSync(outputFilePathMp3);

  return publicPath;
}

async function trimAudio(
  inputFilePath: string,
  outputFilePath: string,
  startTime: string,
  endTime: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .setStartTime(startTime)
      .inputOptions(`-to ${endTime}`)
      .audioCodec("libmp3lame")
      .format("mp3")
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
