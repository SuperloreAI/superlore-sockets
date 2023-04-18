export function extractYouTubeVideoId(url: string) {
  const regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)(\w{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
