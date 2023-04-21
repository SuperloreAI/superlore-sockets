import {
  MediaUpdateInterchangeVideoClip,
  MediaUpdateInterchangeVideoCreate,
  MediaUpdateInterchangeAudioClip,
  MediaUpdateInterchangeAudioCreate,
} from "@superlore/helpers/dist/types/asset-interchange";
import axios from "axios";

export const updateVideoStatus = async (
  args: MediaUpdateInterchangeVideoClip | MediaUpdateInterchangeVideoCreate
) => {
  console.log(`updateVideoStatus-----`);
  console.log(args);
  const databaseServer = process.env.DATABASE_NODE_SERVER || "";
  const endpoint = `${databaseServer}/api/after-create/update-video`;
  const response = await axios.post(endpoint, args);
  console.log(response.data);
  return;
};

export const updateAudioStatus = async (
  args: MediaUpdateInterchangeAudioClip | MediaUpdateInterchangeAudioCreate
) => {
  console.log(`updateAudioStatus ----`);
  console.log(args);
  const databaseServer = process.env.DATABASE_NODE_SERVER || "";
  const endpoint = `${databaseServer}/api/after-create/update-audio`;
  const response = await axios.post(endpoint, args);
  console.log(response.data);
  return;
};
