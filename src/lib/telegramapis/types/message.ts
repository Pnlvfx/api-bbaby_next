/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

type TelegramMessageFrom = {
  id: number;
  is_bot: false;
  first_name: string;
  username: string;
  language_code: string;
};

type TelegramMessageMediaInfo = {
  file_id: string;
  file_unique_id: string;
  file_size: number;
  width: number;
  height: number;
};

type TelegramMessageChat = {
  id: number;
  first_name: string;
  username: string;
  type: string;
};

interface TelegramMessage {
  message_id: number;
  from: TelegramMessageFrom;
  chat: TelegramMessageChat;
  date: number;
  reply_to_message?: TelegramMessage;
  text?: string;
  photo?: TelegramMessageMediaInfo[];
  caption?: string;
  reply_markup?: ReplyMarkup;
  has_protected_content?: boolean;
  video?: {
    duration: number;
    width: number;
    height: number;
    file_name: string;
    mime_type: string;
    thumb: TelegramMessageMediaInfo;
    file_id: string;
    file_unique_id: string;
    file_size: number;
  };
}

interface ReplyToMessage {
  message_id: number;
  from: TelegramMessageFrom;
}

interface TelegramCallbackQuery {
  id: string;
  from: TelegramMessageFrom;
  message: TelegramMessage;
  chat_instance: string;
  data: string;
}
