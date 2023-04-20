import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { Storage } from "@google-cloud/storage";

import { v4 as uuidv4 } from "uuid";

export async function extractRandomScreenshot(
  inputFilePathOriginal: string,
  assetIDVideo: string
): Promise<{ localPath: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    const outputFilePath = path.join(__dirname, "../../../assets");
    const fileName = `${assetIDVideo}-screenshot.jpg`;
    // Generate a random time (in seconds) within the first few seconds of the video
    const randomTime = Math.floor(Math.random() * 5);

    ffmpeg(inputFilePathOriginal)
      .screenshots({
        timestamps: [`${randomTime}%`],
        filename: fileName,
        folder: outputFilePath,
      })
      .on("end", () => {
        const pathToOutputFile = path.join(outputFilePath, fileName);
        resolve({
          localPath: pathToOutputFile,
          fileName,
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
