/* eslint-disable @typescript-eslint/no-unused-vars */
interface PexelsResponse {
  page: number;
  per_page: number;
  videos: PexelsVideo[];
}

type PexelsVideo = {
  id: number;
  width: number;
  height: number;
  duration: number;
  full_res: null;
  tags: [];
  url: string;
  image: string;
  avg_color: null;
  user: PexelsUser;
  video_files: VideoFiles[];
  video_pictures: VideoPictures[];
};

type PexelsUser = {
  id: number;
  name: string;
  url: string;
};

type VideoFiles = {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
};

type VideoPictures = {
  id: number;
  nr: number;
  picture: string;
};
