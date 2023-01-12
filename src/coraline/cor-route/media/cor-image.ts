import sharp from "sharp";
import { catchError } from "../../../lib/common";

const coralineImage = {
  resize: async (image: { filename: string; url: string }) => {
    try {
      const arr = image.filename.split(".");
      const newFile = `${arr[0]}_1920x1080.${arr[1]}`;
      const newUrl = image.url + "?w=1920&h=1080";
      await sharp(image.filename).resize(1920, 1080).toFile(newFile);
      const res = {
        filename: newFile,
        url: newUrl,
      };
      return res;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default coralineImage;
