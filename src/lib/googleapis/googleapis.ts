import serviceAccount from './route/service-account';
import { catchError } from '../../coraline/cor-route/crlerror';
import { getGoogleHeader, getGoogleParent } from './config/googleconfig';
import gapiyoutube from './route/gapiyoube';
import gapiOAuth from './route/gapiOAuth';

const googleapis = {
  translate: async (text: string, from: string, to: string) => {
    try {
      const url = `https://translate.googleapis.com/v3beta1/${getGoogleParent()}:translateText`;
      const body = JSON.stringify({
        contents: [text],
        sourceLanguageCode: from,
        targetLanguageCode: to,
        mimeType: 'text/plain',
      });
      const credentials = await googleapis.serviceAccount.getAccessToken('translate');
      const res = await fetch(url, {
        method: 'POST',
        headers: getGoogleHeader(credentials),
        body,
      });
      const data = (await res.json()) as GoogleTranslateResponse;
      if (!res.ok) throw new Error(data.error?.message);
      return data.translations[0].translatedText;
    } catch (err) {
      throw catchError(err);
    }
  },
  detectLanguage: async (text: string) => {
    try {
      const url = `https://translate.googleapis.com/v3beta1/${getGoogleParent()}:detectLanguage`;
      const body = JSON.stringify({
        content: text,
        mimeType: 'text/plain',
      });
      const credentials = await googleapis.serviceAccount.getAccessToken('translate');
      const res = await fetch(url, {
        method: 'POST',
        headers: getGoogleHeader(credentials),
        body,
      });
      const data = (await res.json()) as GoogleDetectLanguageResponse;
      if (!res.ok) throw new Error(data.error?.message);
      return data.languages[0].languageCode;
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
  serviceAccount,
  OAuth2: gapiOAuth,
  youtube: gapiyoutube,
};

export default googleapis;
