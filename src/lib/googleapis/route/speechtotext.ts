import ffmpeg from '../../ffmpeg/ffmpeg';
import fs from 'fs';
import { getGoogleHeader } from '../config/googleconfig';
import googleapis from '../googleapis';
import { catchError } from '../../../coraline/cor-route/crlerror';
import { promisify } from 'util';

const speechtotext = {
  recognize: async (audio: string, languageCode: 'it-IT' | 'en-US') => {
    try {
      const audios = await convertAudio(audio);
      const credentials = await googleapis.serviceAccount.getAccessToken('speech_to_text');
      const headers = getGoogleHeader(credentials);
      const url = 'https://speech.googleapis.com/v1p1beta1/speech:recognize';
      const config = {
        encoding: 'FLAC',
        languageCode,
      };
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
              transcript.push(_.alternatives[0].transcript);
            });
          } catch (err) {
            throw catchError(err);
          }
        }),
      );
      return transcript;
    } catch (err) {
      throw catchError(err);
    }
  },
  longRunningRecognize: async (input: string, languageCode: 'it-IT' | 'en-US') => {
    try {
      const credentials = await googleapis.serviceAccount.getAccessToken('speech_to_text');
      const headers = getGoogleHeader(credentials);
      const name = await uploadRecognize(input, languageCode);
      const url = `https://speech.googleapis.com/v1p1beta1/operations/${name}`;
      const res = await fetch(url, {
        method: 'GET',
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      console.log(data);
    } catch (err) {
      throw catchError(err);
    }
  },
  // longRunningRecognize2: async (input: string, languageCode: 'it-IT' | 'en-US') => {
  //   try {
  //     const readFile = promisify(fs.readFile);
  //     const buffer = await readFile(input);
  //     const client = new speech.v1p1beta1.SpeechClient();
  //     const [operations] = await client.longRunningRecognize({
  //       audio: {
  //         content: buffer.toString('base64'),
  //       },
  //       config: {
  //         encoding: 'FLAC',
  //         languageCode,
  //       },
  //     });
  //     const [response] = await operations.promise();
  //     fs.writeFile('/tmp.json', JSON.stringify(response), (err) => {
  //       if (err) {
  //         console.log(err);
  //       } else console.log('file saved');
  //     });
  //     //const transcription = response.results?.map((result) => result.alternatives[0].transcript);
  //   } catch (err) {
  //     throw catchError(err);
  //   }
  // },
};

const convertAudio = async (audio: string) => {
  try {
    const duration = await ffmpeg.getDuration(audio);
    if (duration > 50) {
      const audios = await ffmpeg.splitAudioByDuration(audio, 50);
      return audios;
    } else {
      return [audio];
    }
  } catch (err) {
    throw catchError(err);
  }
};

const uploadRecognize = async (input: string, languageCode: 'it-IT' | 'en-US') => {
  try {
    const credentials = await googleapis.serviceAccount.getAccessToken('speech_to_text');
    const headers = getGoogleHeader(credentials);
    const url = 'https://speech.googleapis.com/v1p1beta1/speech:longrunningrecognize';
    const config = {
      encoding: 'FLAC',
      languageCode,
    };
    const readFile = promisify(fs.readFile);
    const buffer = await readFile(input);
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message);
    return data.name;
  } catch (err) {
    throw catchError(err);
  }
};

export default speechtotext;
