import serviceAccount from './route/service-account';
import { getGoogleHeader, getGoogleParent } from './config/googleconfig';
import gapiyoutube from './route/gapiyoube';
import gapiOAuth from './route/gapis-oauth';
import { GoogleDetectLanguageResponse, GoogleTranslateResponse, TextToSpeechResponse } from './types/gapi';

const googleapis = {
  translate: async (text: string, from: string, to: string) => {
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
  },
  detectLanguage: async (text: string) => {
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
  },
  textToSpeech: async (text: string, pitch?: number) => {
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
  },
  serviceAccount,
  OAuth2: gapiOAuth,
  youtube: gapiyoutube,
};

export default googleapis;
