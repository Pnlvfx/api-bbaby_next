interface VideoOptions {
  fps?: string | number;
  transition?: boolean;
  transitionDuration?: number;
  videoBitrate?: number;
  videoCodec?: string;
  size?: string;
  audioBitrate?: string;
  audioChannels?: string;
  format?: string;
  pixelFormat?: string;
}

interface FFmpegImage {
  path: string
  loop: number
}

interface FFmpegCaption { 
  text: string 
  start: number
  duration: number 
}