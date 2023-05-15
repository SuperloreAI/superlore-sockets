import {
  downloadVideoFromYouTube,
  getPlaylistVideoUrls,
} from "@/api/youtube-playlist";
import dotenv from "dotenv";

dotenv.config();
// npx ts-node --project tsconfig.scripts.json -r tsconfig-paths/register ./src/scripts/playlist-download.ts

const run = async () => {
  // Usage example
  const playlistUrl =
    "https://www.youtube.com/playlist?list=PL_82-1Ju0XgzrknpvjIfx8RR3DtNc4CCw";

  // // just list the videos
  // getPlaylistVideoUrls(playlistUrl)
  //   .then((videos) => {
  //     console.log("Videos:", videos);
  //   })
  //   .catch((error) => {
  //     console.error("Error:", error);
  //   });

  // list and actually download the videos
  try {
    const videos = await getPlaylistVideoUrls(playlistUrl);
    for (let i = 0; i < videos.length; i++) {
      await downloadVideoFromYouTube(videos[i].url, videos[i].title);
    }
  } catch (e) {
    console.log(e);
  }
};

run();
