import ffmpeg from '../../ffmpeg/ffmpeg';
import fs from 'fs';
import { promisify } from 'util';
import speech from '@google-cloud/speech';
const client = new speech.SpeechClient();

const speechtotext = {
  recognize: async (audio: string, languageCode: 'it-IT' | 'en-US') => {
    const audios = await convertAudio(audio);
    const transcript: string[] = [];
    await Promise.all(
      audios.map(async (_) => {
        const readFile = promisify(fs.readFile);
        const buffer = await readFile(_);
        const audio = {
          content: buffer.toString('base64'),
        };
        const [response] = await client.recognize({
          audio,
          config: {
            encoding: 'FLAC',
            languageCode,
            audioChannelCount: 2,
          },
        });
        response.results?.map((_) => {
          if (_.alternatives && _.alternatives[0].transcript) {
            transcript.push(_.alternatives[0].transcript);
            console.log(transcript);
          }
        });
      }),
    );
    return transcript;
  },
};

const convertAudio = async (audio: string) => {
  const duration = await ffmpeg.getDuration(audio);
  if (duration > 50) {
    const audios = await ffmpeg.splitAudioByDuration(audio, 50);
    return audios;
  } else {
    return [audio];
  }
};

export default speechtotext;
