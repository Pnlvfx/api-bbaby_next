/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface BotCommands {
  command: string;
  description: string;
}

interface ReplyMarkup {
  inline_keyboard?: InlineKeyboard[][];
  force_reply?: boolean;
}

interface SendPhotoOptions {
  caption?: string;
  protect_content?: boolean;
  allow_sending_without_reply?: boolean;
  disable_notification?: boolean;
  parse_mode?: string;
  reply_markup?: ReplyMarkup;
  reply_to_message_id?: number;
}

interface InlineKeyboard {
  text: string;
  callback_data: string;
}

interface SendMessageOptions {
  reply_to_message_id?: string | number;
  reply_markup?: ReplyMarkup;
}

interface SendPhotoResponse {
  ok: boolean;
  result: {
    message_id: number;
    from: TelegramMessageFrom;
    chat: TelegramMessageChat;
    date: number;
    photo: TelegramMessageMediaInfo[];
  };
}
