import { exec } from "youtube-dl-exec";
import { extractYouTubeVideoId, replaceForwardSlash } from "@/lib/helpers/url";
import youtubeDl from "youtube-dl-exec";
import path from "path";
import { v4 as uuid } from "uuid";
import fs from "fs";

interface VideoInfo {
  id: string;
  url: string;
  title: string;
  channel_id: string;
  channel_name: string;
  thumbnail: string;
}

export async function getPlaylistVideoUrls(
  playlistUrl: string
): Promise<VideoInfo[]> {
  const options = {
    dumpSingleJson: true,
    flatPlaylist: true,
    noCheckCertificates: true,
  };
  console.log(`Lets get it`);
  const { stdout } = await exec(playlistUrl, options);
  console.log(`Got it`);
  const playlistData = JSON.parse(stdout);
  console.log(Object.keys(playlistData));

  return playlistData.entries.map((entry: any) => {
    const { id, url, title, channel_id, channel, thumbnails } = entry;
    const thumbnail = thumbnails[0]?.url || "";
    return { id, url, title, channel_id, channel_name: channel, thumbnail };
  });
}

export async function downloadVideoFromYouTube(
  url: string,
  title?: string
): Promise<any> {
  console.log(`
  
    Next up: ${title}
    Url: ${url}
  
  `);

  const youtubeId = extractYouTubeVideoId(url);
  if (!youtubeId) {
    throw Error(`Invalid YouTube URL = ${youtubeId}`);
  }
  // const assetIDVideo = uuid();
  const outputFilePath = path.join(
    __dirname, // Add this line to make the path relative to the current directory
    "../../assets",
    `${replaceForwardSlash(title || "")}-${youtubeId}.mp4`
  );
  console.log(`__________________________ 0`);
  console.log(`outputFilePath=${outputFilePath}`);

  // Check if the file already exists
  if (fs.existsSync(outputFilePath)) {
    console.log(`File already exists. Skipping download.`);
    return;
  }

  try {
    await youtubeDl(youtubeId, {
      format: "mp4",
      output: outputFilePath,
      noCheckCertificates: true,
    });
    const videoInfo = await youtubeDl(youtubeId, {
      noCheckCertificates: true,
      dumpSingleJson: true,
    });
    console.log(videoInfo.title);
    console.log(`=============================`);

    // Extract title and description
    const videoTitle = videoInfo.title;
    const videoDesc = videoInfo.description;
    const channel = videoInfo.channel;
    const vid = {
      id: youtubeId,
      url,
      title: videoTitle,
      description: videoDesc,
      channel,
    };
    return vid;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
