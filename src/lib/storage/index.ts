import { Storage } from "@google-cloud/storage";
import { getGcpBackendCredentials } from "@/lib/secrets/secrets";

/**
 * 
Here's an example of how you can use the `initStorage()` and `uploadToGCS()` functions in another file:

```typescript
// main.ts

import { initStorage, uploadToGCS } from "./storage";

async function main() {
  const storage = await initStorage();

  const localFilePath = "/path/to/local/file";
  const bucketName = "your-bucket-name";
  const remoteFilePath = "path/in/bucket/file.ext";

  await uploadToGCS(storage, localFilePath, bucketName, remoteFilePath);
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
  console.log(`${localFilePath} uploaded to ${bucketName}/${remoteFilePath}`);
}
