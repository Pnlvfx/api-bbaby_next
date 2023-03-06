import ffmpeg from '../../ffmpeg/ffmpeg';
import fs from 'fs';
import { getGoogleHeader } from '../config/googleconfig';
import googleapis from '../googleapis';
import { catchError } from '../../../coraline/cor-route/crlerror';
import { promisify } from 'util';

const gapisspeechtotext = async (audio: string) => {
  try {
    const credentials = await googleapis.serviceAccount.getAccessToken('speech_to_text');
    const headers = getGoogleHeader(credentials);
    const url = 'https://speech.googleapis.com/v1/speech:recognize';
    const config = {
      encoding: 'FLAC',
      sampleRateHertz: 44100,
      languageCode: 'en-US',
      audio_channel_count: 2,
    };
    const audios = await convertAudio(audio);
    const transcript: string[] = [];
    await Promise.all(
      audios.map(async (_) => {
        try {
          const readFile = promisify(fs.readFile);
          const buffer = await readFile(_);
          const audio = {
            content: buffer.toString('base64'),
          };
          const body = JSON.stringify({
            config,
            audio,
          });
          const res = await fetch(url, {
            method: 'POST',
            headers,
            body,
          });
          const data = (await res.json()) as SpeechToTextResponse;
          if (!res.ok) throw new Error(data.error?.message);
          if (!data.results) throw new Error('Something went wrong!');
          data.results.map((_) => {
            _.alternatives.map((__) => {
              transcript.push(__.transcript);
            });
          });
        } catch (err) {
          return;
        }
      }),
    );
    return transcript;
  } catch (err) {
    throw catchError(err);
  }
};

const convertAudio = async (audio: string) => {
  try {
    const FILE_SIZE_LIMIT = 10485760; // 10MB
    const fileSize = (await fs.promises.stat(audio)).size;
    if (fileSize > FILE_SIZE_LIMIT) {
      const audios = await ffmpeg.splitAudioByDuration(audio, 50);
      return audios;
    } else {
      return [audio];
    }
  } catch (err) {
    throw catchError(err);
  }
};

export default gapisspeechtotext;
