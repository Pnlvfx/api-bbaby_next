import config from '../../config/config';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${config.OPENAI_API_KEY_2}`,
};

const openaiapis = {
  generateImage: async (text: string, n = 1, size = '1024x1024') => {
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
  },
  request: async (prompt: string, options?: AIrequestOptions) => {
    let url = 'https://api.openai.com/v1';
    url += options?.model === 'gpt-3.5-turbo' ? '/chat/completions' : '/completions';
    const model = options?.model || 'text-davinci-003';
    const temperature = options?.temperature || 0.5;
    const stream = options?.stream || false;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        prompt,
        stream,
        temperature,
        max_tokens: 300,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error.message);
    return data.choices[0].text.trim().replace('\n\n', '') as string;
  },
};

export default openaiapis;
