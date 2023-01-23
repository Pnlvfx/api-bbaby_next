interface PostOptions {
  body?: string;
  selectedFile?: string;
  isImage?: boolean;
  isVideo?: boolean;
  height?: number | string;
  width?: number | string;
  sharePostToTG?: boolean;
  sharePostToTwitter?: boolean;
}
