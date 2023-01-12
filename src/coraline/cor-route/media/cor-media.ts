import coraline from "../../coraline";
import coralineVideos from "./cor-videos";
import coralineImage from "./cor-image";
import url from 'url';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { buildMediaPath, buildMediaUrl } from "../../utils/coralineFunctions";

const coralineMedia = {
  image: coralineImage,
  videos: coralineVideos,
  urlisImage: (url: string) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  },
  urlisVideo: (url: string) => {
    return /\.(mp4)$/.test(url);
  },
  getMediaFromUrl: (image_url: string, public_id: string, type: "videos" | "images") => {
    return new Promise<CoralineImage>((resolve, reject) => {
      const protocol = url.parse(image_url).protocol
      const fetcher = protocol === 'https:' ? https : http
      fetcher.get(image_url, (res) => {
        const format = res.headers["content-type"]?.split("/")[1];
        if (!format) return reject("This URL does not contain any images!");
        const filename = buildMediaPath(public_id, type, format);
        const url = buildMediaUrl(public_id, type, format);
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);
        fileStream.on("error", (err) => {
          const error = err as NodeJS.ErrnoException
          if (error.code === 'ENOENT') {
            coraline.use(`/images/${public_id.split('/')[0]}`);
            coraline.media.getMediaFromUrl(url, public_id, type)
          } else {
            throw reject(err);
          }
        });
        fileStream.on("finish", () => {
          fileStream.close();
          const res = { filename, url, format };
          return resolve(res);
        });
      });
    });
  },
  useTempPath: (format: string) => {
    const regex = /\./
    format = regex.test(format) ? format : `.${format}`;
    const folder = coraline.use('images/tmp');
    const id = coraline.generateRandomId(10);
    const filename = `${folder}/${id}${format}`;
    return filename;
  }
};

export default coralineMedia;
