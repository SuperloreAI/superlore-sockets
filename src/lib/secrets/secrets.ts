import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { GoogleAuth } from "google-auth-library";
import { appBackendSecret, openAIKeySecret, projectId } from "@/lib/constants";

async function accessSecretVersion(
  projectId: string,
  secretId: string,
  versionId: string
): Promise<string> {
  // path to repo working directory
  const base64KeyFile = Buffer.from(
    process.env.GCP_KEYFILE_BASE64 || "",
    "base64"
  ).toString("utf-8");
  const credentials = JSON.parse(base64KeyFile);
  // Create a GoogleAuth instance with the credentials
  const auth = new GoogleAuth({
    credentials,
  });
  const client = new SecretManagerServiceClient({
    // Option 1: path to service account keyfile
    // keyFilename: pathToKeyFile,
    // Option 2: stringified service account as .ENV variable
    auth,
  });
  const name = `projects/${projectId}/secrets/${secretId}/versions/${versionId}`;
  const [response] = await client.accessSecretVersion({ name });
  const secretValue = response.payload?.data?.toString();
  if (!secretValue) {
    throw Error("No secret value found");
  }
  return secretValue;
}
export type SecretKey = string;

export const getGcpBackendCredentials = (): Promise<SecretKey> => {
  // Get the secret value
  return accessSecretVersion(
    projectId,
    appBackendSecret.secretId,
    appBackendSecret.versionId
  ) as Promise<SecretKey>;
  // .then((secretValue) => {
  //   console.log(`Secret value: ${secretValue}`);
  // })
  // .catch((error) => {
  //   console.error(`Error accessing secret: ${error}`);
  // });
};

export const getOpenAIKey = (): Promise<SecretKey> => {
  // Get the secret value
  return accessSecretVersion(
    projectId,
    openAIKeySecret.secretId,
    openAIKeySecret.versionId
  ) as Promise<SecretKey>;
};
