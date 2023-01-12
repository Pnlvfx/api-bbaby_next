type METHODPROPS = 'sendMessage' | 'sendPhoto' | 'getUpdates' | 'setWebhook' | 'setMyCommands'

interface TelegramError {
    ok: boolean
    error_code: number
    description: string
}