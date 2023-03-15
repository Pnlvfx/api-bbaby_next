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

interface SendPhotoOptions extends SendMessageOptions {
  caption?: string;
  protect_content?: boolean;
  allow_sending_without_reply?: boolean;
  disable_notification?: boolean;
  parse_mode?: string;
}

interface SendVideoOptions extends SendMessageOptions {
  caption?: string;
  disable_notification?: boolean;
  duration?: number;
  width?: number;
  height?: number;
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
