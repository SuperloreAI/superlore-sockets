import { initStorage, uploadToGCS } from "@/lib/storage";
import axios from "axios";
import fs from "fs";
import path from "path";
import yazl from "yazl";
import { v4 as uuid } from "uuid";

export async function downloadAndZipVideos(
  title: string,
  videoUrls: string[]
): Promise<string> {
  const assetID = uuid();
  // Create output folder
  const outputFolder = path.join(__dirname, "../../assets", `${assetID}`);
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
  }

  // Download videos
  for (let i = 0; i < videoUrls.length; i++) {
    const videoUrl = videoUrls[i];
    const videoPath = path.join(outputFolder, `video${i + 1}.mp4`);

    await new Promise<void>((resolve, reject) => {
      axios
        .get(videoUrl, { responseType: "stream" })
        .then((response) => {
          const fileStream = fs.createWriteStream(videoPath);
          response.data.pipe(fileStream);
          fileStream.on("finish", resolve);
          fileStream.on("error", reject);
        })
        .catch(reject);
    });
  }

  // Zip the output folder
  const outputZipFilePath = path.join(
    __dirname,
    "../../assets",
    `${assetID}.zip`
  );
  const zipfile = new yazl.ZipFile();

  fs.readdirSync(outputFolder).forEach((file) => {
    zipfile.addFile(path.join(outputFolder, file), path.join(assetID, file));
  });

  zipfile.outputStream.pipe(fs.createWriteStream(outputZipFilePath));
  zipfile.end();

  console.log(`Zip file saved at ${outputZipFilePath}`);

  const storage = await initStorage();
  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";
  const assetZipName = `video-${assetID}.zip`;
  try {
    const zipUrl = await uploadToGCS(
      storage,
      outputZipFilePath,
      bucketName,
      assetZipName
    );
    fs.unlinkSync(outputZipFilePath);
    if (fs.existsSync(outputFolder)) {
      fs.rmSync(outputFolder, { recursive: true, force: true });
    }
    return zipUrl;
  } catch (e) {
    throw e;
  }
}

// // Example usage
// const videoUrls = [
//   "https://example.com/video1.mp4",
//   "https://example.com/video2.mp4",
//   // ... more video URLs
// ];

// downloadAndZipVideos("title", videoUrls)
//   .then(() => console.log("Downloaded and zipped videos successfully"))
//   .catch((err) => console.error("Error:", err));
