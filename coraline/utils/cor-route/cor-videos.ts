import { catchError } from "../../../lib/common";
import coraline from "../../coraline";
import { coralinemkDir } from "../coralineFunctions";
import https from 'https';
import fs from 'fs';
import { VideoProps } from "../../@types/video";

const fsPromises = fs.promises;

const videos = {
    splitId: (public_id: string) => {
        try {
          const collection = public_id.split('/');
          if (collection.length !== 2) throw new Error('Invalid public_id');
          return { collection: collection[0], id: collection[1] };
        } catch (err) {
          throw catchError(err);
        }
      },
      buildUrl: (collection: string, id: string) => {
        const url = `${process.env.SERVER_URL}/videos/${collection}/${id}.mp4`;
        return url;
      },
      saveVideo: async (public_id: string, file: string, width: number, height: number) => {
        try {
          const data = coraline.videos.splitId(public_id);
          if (!data) throw new Error(`No data found`);
          const collection = coralinemkDir(`/static/videos/${data.collection}`);
          const filename = `${collection}/${data.id}.mp4`;
          const isUrl = coraline.detectUrl(file);
          if (isUrl) {
            https.get(file, (res) => {
              const fileStream = fs.createWriteStream(filename);
              res.pipe(fileStream);
              fileStream.on('error', (err) => {
                throw new Error(err.message);
              });
              fileStream.on('finish', () => {
                fileStream.close();
              });
            });
          } else {
            const buffer = Buffer.from(file.split(',')[1], 'base64');
            const save = await fsPromises.writeFile(filename, buffer);
          }
          const url = coraline.videos.buildUrl(data.collection, data.id);
          const video = {
            url,
            folder: data.collection,
            format: 'mp4',
            created_at: new Date().toISOString(),
            version: 1,
            public_id,
            resource_type: 'video',
            width,
            height,
          };
          return video as VideoProps;
        } catch (err) {
          throw catchError(err);
        }
      },
}

export default videos;