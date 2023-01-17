type METHODPROPS = 'sendMessage' | 'sendPhoto' | 'getUpdates' | 'setWebhook' | 'setMyCommands' | 'getFile'

interface TelegramError {
    ok: boolean
    error_code: number
    description: string
}