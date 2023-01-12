import { buildUrl, telegramError, telegramHeaders } from "./hooks/telegramhooks";
import { Stream } from "stream";
import fs from "fs";
import https from "https";
import FormData from "form-data";
import { catchError } from "../common";
import { BotCommands } from "./types/bot";

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
