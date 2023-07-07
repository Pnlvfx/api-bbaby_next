export interface SpeechToTextResponse {
  results?: Results[];
  error?: GoogleError;
}

export interface TextToSpeechResponse {
  audioContent: string;
  error?: GoogleError;
}

export interface GoogleTranslateResponse {
  translations: {
    translatedText: string;
  }[];
  error?: GoogleError;
}

export interface GoogleDetectLanguageResponse {
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
