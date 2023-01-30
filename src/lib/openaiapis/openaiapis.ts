import { catchError } from '../../coraline/cor-route/crlerror';
import config from '../../config/config';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.OPENAI_API_KEY}`,
};

const openaiapis = {
  translate: async (text: string, from: string, to: string) => {
    try {
      const url = 'https://api.openai.com/v1/completions';
      const translate_msg = `Transform this text from ${from} to ${to}, you are allowed to change something, but it's important that is readable for people`;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt: `${translate_msg}: ${text.substring(0, 3300)}`,
          temperature: 0.3,
          max_tokens: text.length,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error.message);
      return data.choices[0].text.trimStart() as string;
    } catch (err) {
      throw catchError(err);
    }
  },
  generateImage: async (text: string, n = 1, size = '1024x1024') => {
    try {
      const url = 'https://api.openai.com/v1/images/generations';
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: text,
          n,
          size,
          response_format: 'url',
        }),
      });
      const data = (await res.json()) as AImageResponse;
      if (!res.ok) throw new Error(data.error.message);
      return data.data;
    } catch (err) {
      throw catchError(err);
    }
  },
  synthetize: async (text: string) => {
    try {
      const url = 'https://api.openai.com/v1/completions';
      const prompt = `I want you to tell me what is this story talking about in one word in english, just send the word without extra arguments: \n ${text}`;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'text-davinci-002',
          prompt,
          temperature: 0.7,
          max_tokens: text.length,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error.message);
      return data.choices[0].text.replace('\n\n', '') as string;
    } catch (err) {
      throw catchError(err);
    }
  },
  request: async (prompt: string) => {
    try {
      const url = 'https://api.openai.com/v1/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt,
          temperature: .5,
          max_tokens: 300,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error.message);
      return data.choices[0].text.trim().replace('\n\n', '') as string;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default openaiapis;
