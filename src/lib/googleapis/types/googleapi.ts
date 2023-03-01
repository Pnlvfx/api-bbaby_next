/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface SpeechToTextResponse {
  results?: Results[];
  error?: GoogleError;
}

interface TextToSpeechResponse {
  audioContent: string;
  error?: GoogleError;
}

interface GoogleTranslateResponse {
  translations: {
    translatedText: string;
  }[];
  error?: GoogleError;
}

interface GoogleDetectLanguageResponse {
  languages: {
    languageCode: string;
    confidence: number;
  }[];
  error?: GoogleError;
}

type GoogleError = {
  code: number;
  status: string;
  message: string;
  details: [];
};

type Results = {
  alternatives: {
    transcript: string;
    confidence: number;
  }[];
  resultEndTime: string;
  languageCode: string;
};
