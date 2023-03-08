import { catchError } from '../../../coraline/cor-route/crlerror';
import googleapis from '../googleapis';
import config from '../../../config/config';

const gapiyoutube = {
  insert: async (title: string, description: string, tags: string, categoryId: string, privacyStatus: string) => {
    try {
      const base_url = `https://youtube.googleapis.com/youtube/v3/videos`;
      const query = `part=snippet&part=status&key=${config.YOUTUBE_CLIENT_ID}`;
      const url = `${base_url}?${query}`;
      //const youtubeFolder = coraline.use('youtube');
      // const videoFilePath = `${youtubeFolder}/video1.mp4`;
      // const thumbFilePath = `${youtubeFolder}/image0.webp`;
      const credentials = await googleapis.OAuth2.checkTokenValidity();
      const headers = {
        Authorization: `Bearer ${credentials.access_token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const input = {
        snippet: {
          title,
          description,
          tags: [tags],
          categoryId,
          defaultAudioLanguage: 'it',
          defaultLanguage: 'it',
        },
        status: {
          privacyStatus,
        },
      };
      const body = JSON.stringify(input);
      const response = await fetch(url, {
        method: 'post',
        headers,
        body,
      });
      if (response.statusText === 'Unauthorized') {
        throw new Error('Youtube API says you are unauthorized');
      }
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : null;
      if (!response.ok) {
        const error = data.error.message;
        throw new Error(error);
      } else {
        console.log(data);
      }
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default gapiyoutube;
