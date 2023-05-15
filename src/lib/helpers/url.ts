export function extractYouTubeVideoId(url: string) {
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|.*\/|v\/)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export const extractTikTokVideoId = (url: string): string | null => {
  console.log(url);
  const tiktokVideoIdRegex = /(?:video\/)(\d+)/;
  const match = url.match(tiktokVideoIdRegex);

  return match ? match[1] : null;
};

export function replaceForwardSlash(str: string) {
  var regex = /\//g;
  var replacedStr = str.replace(regex, "-");
  return replacedStr;
}
