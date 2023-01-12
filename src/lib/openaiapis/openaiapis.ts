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
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'text-davinci-003',
          prompt: `Translate this text from ${from} to ${to}: \n\n ${text.substring(0, 3300)}`,
          temperature: 0.3,
          max_tokens: text.length,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(`Unable to translate text: ${res.statusText + ' ' + res.status}`);
      return data.choices[0].text;
    } catch (err) {
      console.log(err);
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
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      return data.data;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default openaiapis;
