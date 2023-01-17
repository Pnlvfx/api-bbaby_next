export const buildUrl = (METHOD: METHODPROPS, query?: string) => {
  const base_url = "https://api.telegram.org";
  const token = process.env.TELEGRAM_TOKEN;
  let url = `${base_url}/bot${token}/${METHOD}`;
  if (query) {
    url = `${url}?${query}`;
  }
  return url;
};

export const telegramHeaders = {
  "content-type": "application/x-www-form-urlencoded",
};

export const telegramError = (err: TelegramError) => {
  throw new Error(`Error code: ${err.error_code}, ${err.description}`);
};

export const checkUpdateType = (data: TelegramUpdate) => {
  if ('message' in data) {
    return 'message'
  } else {
    return 'reply_callback'
  }
}
