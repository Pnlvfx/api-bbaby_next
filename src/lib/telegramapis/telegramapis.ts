import { buildUrl, telegramError, telegramHeaders } from "./hooks/telegramhooks";
import { Stream } from "stream";
import fs from "fs";
import https from "https";
import FormData from "form-data";
import { catchError } from "../../coraline/cor-route/crlerror";

const telegramapis = {
  sendMessage: async (chatId: string | number, text: string) => {
    try {
      const query = `chat_id=${chatId}&text=${text}`;
      const url = buildUrl("sendMessage", query);
      const res = await fetch(url, {
        method: "POST",
        headers: telegramHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw telegramError(data);
      return data;
    } catch (err) {
      throw catchError(err);
    }
  },
  sendPhoto: async (chatId: string | number, photo: string | Stream, options?: SendPhotoOptions) => {
    try {
      const form = new FormData();
      form.append("chat_id", chatId);
      if (options) {
        const usedOptions = Object.entries(options).filter(([key, value]) => value !== undefined);
        usedOptions.forEach(([key, value]) => {
          form.append(key, String(value));
        });
      }
      let data = "";
      const req_options = {
        host: "api.telegram.org",
        path: `/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`,
        method: "POST",
        headers: {},
      };
      if (photo instanceof Stream) {
        if (photo instanceof fs.ReadStream) {
          console.log("its a stream");
          form.append("photo", photo);
          req_options.headers = form.getHeaders();
        }
      } else if (photo.startsWith("http")) {
        console.log("typeof url");
        data = `photo=${photo}&chat_id=${chatId}`;
        if (options) {
          const usedOptions = Object.entries(options).filter(([key, value]) => value !== undefined);
          usedOptions.forEach(([key, value]) => {
            data += `&${key}=${value}`;
          });
        }
        req_options.headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": data.length,
        };
      } else {
        console.log("typeof string");
        form.append("photo", fs.createReadStream(photo));
        req_options.headers = form.getHeaders();
      }

      const req = https.request(req_options, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log(`Response: ${chunk}`);
        });
        res.on("end", () => {
          console.log("No more data in response.");
        });
      });
      req.on("error", (error: Error) => {
        console.error(`Error: ${error.message}`);
      });
      if (data) {
        req.write(data);
      } else {
        form.pipe(req);
      }
    } catch (err) {
      throw catchError(err);
    }
  },
  setMyCommands: async (commands: BotCommands[]) => {
    try {
      commands.map((_) => {
        if (!_.command.match("/")) _.command = "/" + _.command;
      });
      const url = buildUrl("setMyCommands");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ commands }),
      });
      const data = await res.json();
      if (!res.ok) telegramError(data);
      return data;
    } catch (err) {
      throw catchError(err);
    }
  },
  setWebHook: async (webhookurl: string) => {
    try {
      const url = buildUrl("setWebhook", `url=${webhookurl}`);
      const res = await fetch(url, {
        method: "POST",
        headers: telegramHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw telegramError(data);
      return data;
    } catch (err) {
      throw catchError(err);
    }
  },
  getUpdates: async () => {
    try {
      const url = buildUrl("getUpdates");
      const res = await fetch(url, {
        method: "POST",
        headers: telegramHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw telegramError(data);
      //await fsPromises.writeFile('telegramLogs.json', JSON.stringify(response));
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default telegramapis;
