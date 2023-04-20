import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import type { VideoMetadata } from "@superlore/helpers/dist/types/asset-interchange.d.ts";

export const getVideoMetadata = async (
  filePath: string
): Promise<VideoMetadata> => {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }

  return new Promise((resolve, reject) => {
    let metadata: VideoMetadata = {};

    ffmpeg.ffprobe(filePath, (error, data) => {
      if (error) {
        reject(error);
      } else {
        const videoStream = data.streams.find(
          (stream) => stream.codec_type === "video"
        );
        const audioStream = data.streams.find(
          (stream) => stream.codec_type === "audio"
        );

        if (videoStream) {
          metadata.width = videoStream.width;
          metadata.height = videoStream.height;
          metadata.duration = parseFloat(videoStream.duration || "0");
          metadata.aspectRatio = videoStream.display_aspect_ratio
            ? parseFloat(videoStream.display_aspect_ratio)
            : metadata.width && metadata.height
            ? metadata.width / metadata.height
            : undefined;
          metadata.frameRate = videoStream.avg_frame_rate
            ? parseFloat(videoStream.avg_frame_rate)
            : undefined;
          metadata.videoCodec = videoStream.codec_name;
        }

        if (audioStream) {
          metadata.audioCodec = audioStream.codec_name;
        }

        metadata.originalSource = filePath;

        resolve(metadata);
      }
    });
  });
};
