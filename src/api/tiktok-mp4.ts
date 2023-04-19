import { downloadAndUpload, initStorage } from "@/lib/storage";
import axios from "axios";
import { v4 as uuid } from "uuid";
import path from "path";
import { extractTikTokVideoId } from "@/lib/helpers/url";

const tiktokDL = async (url: string) => {
  let domain = "https://www.tikwm.com/";
  let res = await axios.post(
    domain + "api/",
    {},
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 'cookie': 'current_language=en; _ga=GA1.1.115940210.1660795490; _gcl_au=1.1.669324151.1660795490; _ga_5370HT04Z3=GS1.1.1660795489.1.1.1660795513.0.0.0',
        "sec-ch-ua":
          '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
      },
      params: {
        url: url,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1,
      },
    }
  );

  return {
    nowm: domain + res.data.data.play,
    wm: domain + res.data.data.wmplay,
    music: domain + res.data.data.music,
  };
};

export const extractTikTokVideo = async (url: string) => {
  const tikTokVideoId = extractTikTokVideoId(url);
  if (!tikTokVideoId) {
    throw new Error("No TikTok Video URL Found");
  }
  if (url.indexOf("tiktok.com") === -1) {
    throw new Error("Invalid TikTok URL");
  }
  const { nowm, wm, music } = await tiktokDL(url);

  const assetIDVideo = uuid();
  const outputFilePathVideo = path.join(
    __dirname, // Add this line to make the path relative to the current directory
    "../../assets",
    `${tikTokVideoId}-${assetIDVideo}.mp4`
  );

  const assetIDAudio = uuid();
  const outputFilePathAudio = path.join(
    __dirname, // Add this line to make the path relative to the current directory
    "../../assets",
    `${tikTokVideoId}-${assetIDAudio}.mp4`
  );

  try {
    const [uploadedVideoPath, uploadedMusicPath] = await Promise.all([
      downloadAndUpload(nowm, assetIDVideo, outputFilePathVideo, "mp4"),
      downloadAndUpload(music, assetIDAudio, outputFilePathAudio, "mp3"),
    ]);

    console.log(`Video and music have been uploaded.`);

    // Return the uploaded file paths
    return {
      video: uploadedVideoPath,
      music: uploadedMusicPath,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error extracting tiktok video to GCS");
  }
};
