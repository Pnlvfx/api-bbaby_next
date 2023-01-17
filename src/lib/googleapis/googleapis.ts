import serviceAccount from './route/service-account';
import { catchError } from '../../coraline/cor-route/crlerror';
import { getGoogleHeader } from './config/googleconfig';
import gapisspeechtotext from './route/gapisspeechtotext';
import gapiyoutube from './route/gapiyoube';
import gapiOAth from './route/gapiOAuth';

const googleapis = {
  OAuth2: gapiOAth,
  youtube: gapiyoutube,
  serviceAccount,
  translate: async (text: string, from: string, to: string) => {
    try {
      const projectId = 'bbabystyle';
      const location = 'us-central1';
      const parent = `projects/${projectId}/locations/${location}`;
      const mimeType = 'text/plain';
      const sourceLanguageCode = from;
      const targetLanguageCode = to;
      const url = `https://translate.googleapis.com/v3beta1/${parent}:translateText`;
      const body = JSON.stringify({
        contents: [text],
        targetLanguageCode,
        sourceLanguageCode,
        mimeType,
      });
      const credentials = await googleapis.serviceAccount.getAccessToken('translate');
      const res = await fetch(url, {
        method: 'POST',
        headers: getGoogleHeader(credentials),
        body,
      });
      const data = (await res.json()) as GoogleTranslateResponse;
      if (!res.ok) throw new Error(data.error?.message);
      for (const translation of data.translations) {
        return translation.translatedText as string;
      }
    } catch (err) {
      throw catchError(err);
    }
  },
  textToSpeech: async (text: string, pitch?: number) => {
    try {
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize`;
      const credentials = await googleapis.serviceAccount.getAccessToken('text_to_speech');
      const body = JSON.stringify({
        input: {
          text,
        },
        voice: {
          languageCode: 'it',
          ssmlGender: 'MALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch,
        },
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: getGoogleHeader(credentials),
        body,
      });
      const data = (await res.json()) as TextToSpeechResponse;
      if (!res.ok) throw new Error(data.error?.message);
      return data;
    } catch (err) {
      throw catchError(err);
    }
  },
  speechToText: gapisspeechtotext,
};

export default googleapis;
