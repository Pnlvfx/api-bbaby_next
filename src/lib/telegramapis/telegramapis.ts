import { telegramError, telegramHeaders } from './hooks/telegramhooks';
import { Stream } from 'stream';
import fs from 'fs';
import https from 'https';
import FormData from 'form-data';
import { catchError } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';

const telegramapis = (token: string) => {
  const buildUrl = (METHOD: METHODPROPS, query?: string) => {
    const base_url = 'https://api.telegram.org';
    let url = `${base_url}/bot${token}/${METHOD}`;
    if (query) {
      url = `${url}?${query}`;
    }
    return url;
  };
  return {
    sendMessage: async (chatId: string | number, text: string, options?: SendMessageOptions) => {
      try {
        let query = `chat_id=${chatId}&text=${text}`;
        if (options) {
          const usedOptions = Object.entries(options).filter(([, value]) => value !== undefined);
          usedOptions.forEach(([key, value]) => {
            query += `&${key}=${JSON.stringify(value)}`;
          });
        }
        const url = buildUrl('sendMessage', query);
        const res = await fetch(url, {
          method: 'POST',
          headers: telegramHeaders,
        });
        const data = await res.json();
        if (!res.ok) throw telegramError(data);
        return data;
      } catch (err) {
        throw catchError(err);
      }
    },
    sendPhoto: (chatId: string | number, photo: string | Stream, options?: SendPhotoOptions) => {
      return new Promise<SendPhotoResponse>((resolve, reject) => {
        const form = new FormData();
        form.append('chat_id', chatId);
        if (options) {
          const usedOptions = Object.entries(options).filter(([, value]) => value !== undefined);
          usedOptions.forEach(([key, value]) => {
            form.append(key, JSON.stringify(value));
          });
        }
        let data = '';
        const req_options = {
          host: 'api.telegram.org',
          path: `/bot${token}/sendPhoto`,
          method: 'POST',
          headers: {},
        };
        if (photo instanceof Stream) {
          if (photo instanceof fs.ReadStream) {
            form.append('photo', photo);
            req_options.headers = form.getHeaders();
          }
        } else if (photo.startsWith('http')) {
          data = `photo=${photo}&chat_id=${chatId}`;
          if (options) {
            if (options.reply_markup) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              options.reply_markup = JSON.stringify(options.reply_markup) as any;
            }
            const usedOptions = Object.entries(options).filter(([, value]) => value !== undefined);
            usedOptions.forEach(([key, value]) => {
              data += `&${key}=${JSON.stringify(value)}`;
            });
          }
          req_options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
          };
        } else {
          form.append('photo', fs.createReadStream(photo));
          req_options.headers = form.getHeaders();
        }

        const req = https.request(req_options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            resolve(JSON.parse(chunk) as SendPhotoResponse);
          });
          // res.on('end', () => {

          // });
        });
        req.on('error', (error) => {
          reject(`Error: ${error.message}`);
        });
        if (data) {
          req.write(data);
        } else {
          form.pipe(req);
        }
      });
    },
    sendVideo: (chatId: string | number, video: string | Stream, options?: SendVideoOptions) => {
      return new Promise<SendPhotoResponse>((resolve, reject) => {
        const form = new FormData();
        form.append('chat_id', chatId);
        if (options) {
          const usedOptions = Object.entries(options).filter(([, value]) => value !== undefined);
          usedOptions.forEach(([key, value]) => {
            form.append(key, JSON.stringify(value));
          });
        }
        let data = '';
        const req_options = {
          host: 'api.telegram.org',
          path: `/bot${token}/sendVideo`,
          method: 'POST',
          headers: {},
        };
        if (video instanceof Stream) {
          if (video instanceof fs.ReadStream) {
            form.append('video', video);
            req_options.headers = form.getHeaders();
          }
        } else if (video.startsWith('http')) {
          data = `video=${video}&chat_id=${chatId}`;
          if (options) {
            if (options.reply_markup) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              options.reply_markup = JSON.stringify(options.reply_markup) as any;
            }
            const usedOptions = Object.entries(options).filter(([, value]) => value !== undefined);
            usedOptions.forEach(([key, value]) => {
              data += `&${key}=${JSON.stringify(value)}`;
            });
          }
          req_options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
          };
        } else {
          form.append('video', fs.createReadStream(video));
          req_options.headers = form.getHeaders();
        }

        const req = https.request(req_options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            resolve(JSON.parse(chunk) as SendPhotoResponse);
          });
          // res.on('end', () => {

          // });
        });
        req.on('error', (error) => {
          reject(`Error: ${error.message}`);
        });
        if (data) {
          req.write(data);
        } else {
          form.pipe(req);
        }
      });
    },
    deleteMessage: async (chatId: string | number, message_id: string | number) => {
      try {
        const url = buildUrl('deleteMessage', `chat_id=${chatId}&message_id=${message_id}`);
        console.log(url);
        const res = await fetch(url, {
          method: 'DELETE',
          headers: telegramHeaders,
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      } catch (err) {
        throw catchError(err);
      }
    },
    setMyCommands: async (commands: BotCommands[]) => {
      try {
        commands.map((_) => {
          if (!_.command.match('/')) _.command = '/' + _.command;
        });
        const url = buildUrl('setMyCommands');
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
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
        const url = buildUrl('setWebhook', `url=${webhookurl}`);
        const res = await fetch(url, {
          method: 'POST',
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
        const url = buildUrl('getUpdates');
        const res = await fetch(url, {
          method: 'POST',
          headers: telegramHeaders,
        });
        const data = await res.json();
        if (!res.ok) throw telegramError(data);
        //await fsPromises.writeFile('telegramLogs.json', JSON.stringify(response));
      } catch (err) {
        throw catchError(err);
      }
    },
    // eslint-disable-next-line no-unused-vars
    downloadFile: (fileId: string, costumOutput?: (ext: string) => string) => {
      return new Promise<string>((resolve, rejects) => {
        const url = buildUrl('getFile', `file_id=${fileId}`);
        https.get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('error', (err) => {
            rejects(err);
          });
          res.on('end', () => {
            const filePath = JSON.parse(data).result.file_path as string;
            const mediaUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
            const extension = filePath.split('.').pop()?.toLowerCase() as string;
            let filename: string;
            if (costumOutput) {
              filename = costumOutput(extension);
            } else {
              const folder = coraline.use('videos/tmp');
              filename = `${folder}/${fileId.substring(0, 10)}.${extension}`;
            }
            https.get(mediaUrl, (response) => {
              response.pipe(fs.createWriteStream(filename));
              response.on('end', () => {
                resolve(filename);
              });
            });
          });
        });
      });
    },
  };
};

export default telegramapis;
