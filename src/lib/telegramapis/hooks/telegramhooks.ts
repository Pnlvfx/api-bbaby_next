export const telegramHeaders = {
  'content-type': 'application/x-www-form-urlencoded',
};

export const telegramError = (err: TelegramError) => {
  throw new Error(`Error code: ${err.error_code}, ${err.description}`);
};
