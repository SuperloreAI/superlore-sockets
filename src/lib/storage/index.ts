import { Storage } from "@google-cloud/storage";
import { getGcpBackendCredentials } from "@/lib/secrets/secrets";
import axios from "axios";
import fs from "fs";

/**
 * 
Here's an example of how you can use the `initStorage()` and `uploadToGCS()` functions in another file:

```typescript
// main.ts

import { initStorage, uploadToGCS } from "./storage";
import fs from 'fs';

async function main() {
  const storage = await initStorage();

  const localFilePath = "/path/to/local/file";
  const bucketName = "your-bucket-name";
  const remoteFilePath = "path/in/bucket/file.ext";

  const url = await uploadToGCS(storage, localFilePath, bucketName, remoteFilePath);
}

main();
```

This example assumes that you have a local file at `/path/to/local/file` and you want to upload it to the Google Cloud Storage bucket with name `your-bucket-name` and path `path/in/bucket/file.ext`. Replace these placeholders with your actual values.

 */

export async function initStorage() {
  const PROJECT_ID = process.env.GCP_PROJECT_ID;
  const creds = await getGcpBackendCredentials();
  const credentials = JSON.parse(creds);
  const storage = new Storage({
    projectId: PROJECT_ID,
    credentials: credentials,
  });

  return storage;
}

export async function downloadFile(
  url: string,
  destination: string
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    console.log(`Downloaoding file...`);
    console.log(`url=${url}`);
    console.log(`destination=${destination}`);
    try {
      console.log(`Axios file...`);
      const response = await axios.get(url, {
        responseType: "stream",
      });
      console.log(`Got axios file...`);
      const file = fs.createWriteStream(destination);
      response.data.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve(destination);
      });

      file.on("error", (err: Error) => {
        fs.unlinkSync(destination);
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function uploadToGCS(
  storage: Storage,
  localFilePath: string,
  bucketName: string,
  remoteFilePath: string
) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(remoteFilePath);
  await bucket.upload(localFilePath, {
    destination: file,
  });
  await file.makePublic();
  console.log(`${localFilePath} uploaded to ${bucketName}/${remoteFilePath}`);
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${remoteFilePath}`;
  return publicUrl;
}

export const downloadAndUpload = async (
  url: string,
  assetID: string,
  outputFilePath: string,
  fileType: "mp4" | "mp3",
  fileName: string
) => {
  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(outputFilePath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  const bucketName = process.env.APP_BUCKET_ASSET_LIBRARY_BUCKET || "";
  const storage = await initStorage();

  const publicUrl = await uploadToGCS(
    storage,
    outputFilePath,
    bucketName,
    fileName
  );

  console.log(`File has been uploaded as ${fileName}`);

  fs.unlink(outputFilePath, (err) => {
    if (err) {
      console.error(`Error deleting local file: ${err.message}`);
    } else {
      console.log(`Local file '${outputFilePath}' has been deleted.`);
    }
  });

  return publicUrl;
};
