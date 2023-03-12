export const telegramHeaders = {
  'content-type': 'application/x-www-form-urlencoded',
};

export const telegramError = (err: TelegramError) => {
  throw new Error(`Error code: ${err.error_code}, ${err.description}`);
};

export const checkUpdateType = (data: TelegramUpdate) => {
  if ('message' in data) {
    return 'message';
  } else {
    return 'reply_callback';
  }
};
