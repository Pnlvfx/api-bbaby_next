import { catchError } from '../../coraline/cor-route/crlerror';
import config from '../../config/config';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.OPENAI_API_KEY_2}`,
};

const openaiapis = {
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
  request: async (prompt: string, temperature = 0.5) => {
    try {
      const url = 'https://api.openai.com/v1/completions';
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          prompt,
          temperature,
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
  myrequest: async (text: string) => {
    try {
      const body = JSON.stringify({ text });
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      const res = await fetch('http://localhost:8080/request', {
        method: 'POST',
        body,
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message);
      return data as string;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default openaiapis;
