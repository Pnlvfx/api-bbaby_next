import { TokensProps } from '../../models/types/user';
import config from '../../config/config';
const USER_AGENT = `bbabysyle/1.0.0 (www.bbabytyle.com)`;

const redditapis = {
  getNewToken: async (redditTokens: TokensProps) => {
    const encondedHeader = Buffer.from(`${config.REDDIT_CLIENT_ID}:${config.REDDIT_CLIENT_SECRET}`).toString('base64');
    const res = await fetch(`https://www.reddit.com/api/v1/access_token`, {
      method: 'POST',
      body: `grant_type=refresh_token&refresh_token=${redditTokens.refresh_token}`,
      headers: { authorization: `Basic ${encondedHeader}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!res.ok) throw new Error('For some reason reddit have refused your credentials. Please try to contact reddit support.');
    const body = await res.json();
    const expiration = Date.now() + 3600;
    redditTokens.access_token = body.access_token;
    redditTokens.expires = expiration;
    return body.access_token as string;
  },
  getPostsWithToken: async (access_token: string, after?: string, count?: string): Promise<RedditResponse> => {
    const url = `https://oauth.reddit.com/best?sr_detail=true`;
    const query = after ? `after=${after}&count=${count}` : undefined;
    const finalUrl = query ? `${url}&${query}` : url;
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: { authorization: `bearer ${access_token}`, 'User-Agent': USER_AGENT },
    });
    if (!response.ok) throw new Error(response.status + response.statusText);
    return response.json();
  },
  getPostsFromCommunity: async (community: string) => {
    const res = await fetch(`https://api.reddit.com/r/${community}`, {
      method: 'get',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message);
    return data as RedditResponse;
  },
  getPosts: async (after?: string, count?: string) => {
    const url = 'https://api.reddit.com';
    const query = after ? `after=${after}&count=${count}` : undefined;
    const finalUrl = query ? `${url}?${query}` : url;
    const res = await fetch(finalUrl, {
      method: 'get',
    });
    const data = await res.json();
    return data as RedditResponse;
  },
};

export default redditapis;
