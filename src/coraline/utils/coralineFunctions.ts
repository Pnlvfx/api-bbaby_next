import path from "path";
import fs from "fs";
import coraline from "../coraline";

const _path = process.cwd();
export const coraline_path = path.resolve(_path, "../coraline");
export const projectName = _path.split("/")[_path.split("/").length - 1].replace("api-", "").replace("api_", "");

const givePermissionToFolder = (folder: string) => {
  fs.chmod(folder, '777', (err) => {
    if (err) throw new Error(`Cannot change permissions for this folder: ${folder}`)
    const last_route = folder.split('/')[folder.split('/').length - 1];
    if (last_route === 'coraline') {
        return givePermissionToFolder(folder)
    }
    const parentFolder = path.dirname(folder)
    if (parentFolder !== '/' && last_route !== 'coraline') {
      givePermissionToFolder(parentFolder)
    }
  })
}

export const coralinemkDir = (folder: string) => {
  fs.mkdir(folder, { recursive: true }, (err) => {
    if (err) {
      if (err.code != "EEXIST") throw new Error(err.message);
    }
    givePermissionToFolder(folder);
  });
  return folder;
};

export const buildMediaPath = (public_id: string, type: "images" | "videos", format: string) => {
  const split = public_id.split("/"); //split 1 is folder split[2] is the id
  const path = coraline.use(`${type}/${split[0]}`);
  const filename = `${path}/${split[1]}.${format}`;
  return filename;
};

export const buildMediaUrl = (public_id: string, type: "images" | "videos", format: string, w?: number, h?: number) => {
  const split = public_id.split("/");
  const url = `${process.env.SERVER_URL}/${type}/${split[0].toLowerCase()}/${split[1]}.${format}`;
  const query = `?w=${w}&h=${h}`;
  const final_url = w && h ? `${url}${query}` : url;
  return final_url;
};

export const stringify = (data: unknown) => {
  if (typeof data === "string") {
    return data;
  }
  return JSON.stringify(data);
};
