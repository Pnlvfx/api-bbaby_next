/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
type METHODPROPS = 'sendMessage' | 'deleteMessage' | 'sendPhoto' | 'getUpdates' | 'setWebhook' | 'setMyCommands' | 'getFile';

interface TelegramError {
  ok: boolean;
  error_code: number;
  description: string;
}
