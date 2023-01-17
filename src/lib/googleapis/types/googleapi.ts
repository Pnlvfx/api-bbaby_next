interface SpeechToTextResponse {
    results: Results[]
    error?: GoogleError
}

interface TextToSpeechResponse {
    audioContent: string
    error?: GoogleError
}

interface GoogleTranslateResponse {
    translations: {
        translatedText: string
    }[]
    error?: GoogleError
}

type GoogleError = {
    code: number
    status: string
    message: string
    details: any[]
}

type Results = {
    alternatives: {
        transcript: string
        confidence: number
    }[]
    resultEndTime: string
    languageCode: string
}