export type METHODPROPS = 'sendMessage' | 'sendPhoto' | 'getUpdates' | 'setWebhook' | 'setMyCommands'

export interface TelegramError {
    ok: boolean
    error_code: number
    description: string
}