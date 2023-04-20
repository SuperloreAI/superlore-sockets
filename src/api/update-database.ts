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
  const databaseServer = process.env.DATABASE_NODE_SERVER || "";
  const endpoint = `${databaseServer}/api/after-create/after-create-clipped`;
  const response = await axios.post(endpoint, args);
  console.log(response.data);
  return;
};

export const updateAudioStatus = async (
  args: MediaUpdateInterchangeAudioClip | MediaUpdateInterchangeAudioCreate
) => {
  const databaseServer = process.env.DATABASE_NODE_SERVER || "";
  const endpoint = `${databaseServer}/api/update-video`;
  const response = await axios.post(endpoint, args);
  console.log(response.data);
  return;
};
