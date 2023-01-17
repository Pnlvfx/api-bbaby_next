import { spawn } from "child_process";
import { convertEnd } from "./hooks/magickhooks";
import coraline from "../../coraline/coraline";
import path from "path";
import config from "../../config/config";
import sharp from "sharp";

sharp.gravity

const imagemagick = {
  blurImage: (image: string, radius: number, deviation: number) => {
    return new Promise<string>((resolve, rejects) => {
      const isUrl = coraline.isUrl(image);
      let imagepath = image;
      if (isUrl) {
        const toReplace = image.replace(config.SERVER_URL, "");
        const filename = path.basename(toReplace);
        const folder = toReplace.replace(filename, "");
        const basepath = coraline.use(folder);
        imagepath = path.join(basepath, filename);
      }
      const options = ["-blur", `${radius}x${deviation}`];
      const convert = spawn("convert", [image, ...options, imagepath]);
      convert.on("close", async (code) => {
        if (code === 0) {
          resolve(image);
        } else {
          rejects("Failed to save image.");
        }
      });
    });
  },
  textToImage: (text: string, options?: DefaultImageMagickOptions) => {
    return new Promise<string>(async (resolve, rejects) => {
      try {
        const width = options?.width || 1024
        const height = options?.width || 1024
        const textImage = await imagemagick.createImageFromColor("transparent", width, height);
        const gravity = options?.gravity || "center";
        const fontSize = options?.fontSize?.toString() || "60";
        const fill = options?.fill || "white";
        const font = options?.font || "Helvetica";
        const offsetX = options?.offsetX || '0';
        const offsetY = options?.offsetY || '0';
        /* prettier-ignore */
        const convert = spawn("convert", [textImage,
          "-size", `${width}x${height}`,
          "-gravity", gravity, 
          "-font", font, 
          "-pointsize", fontSize, 
          "-fill", fill, 
          "-annotate", `+${offsetX}+${offsetY}`, text,
          textImage
        ]
        /* prettier-ignore */);
        await convertEnd(convert, (code) => {
          if (code === 0) resolve(textImage);
        });
      } catch (err) {
        rejects(err);
      }
    });
  },
  createImageFromColor: (color: string, width: number | string, height: number | string) => {
    return new Promise<string>(async (resolve, rejects) => {
      try {
        const output = coraline.media.useTempPath("png");
        /* prettier-ignore */
        const convert = spawn("convert", [
          "-size", `${width}x${height}`,
          "xc:none",
          output
        ]);
        /* prettier-ignore */
        await convertEnd(convert, (code) => {
          if (code === 0) resolve(output);
        });
      } catch (err) {
        rejects(err);
      }
    });
  },
  composite: (background: string, textImage: string, output?: string) => {
    return new Promise<string>(async (resolve, rejects) => {
      try {
        if (coraline.isUrl(background)) return rejects("For now we only support local images");
        const gravity = "center";
        const out = output || coraline.media.useTempPath("png");
        /* prettier-ignore */
        const convert = spawn('convert', [
          background,
          textImage,
          '-gravity', gravity,
          '-composite',
          out
        ])
        /* prettier-ignore */
        await convertEnd(convert, (code) => {
          if (code === 0) return resolve(out);
        })
      } catch (err) {
        rejects(err);
      }
    });
  },
};

export default imagemagick;
