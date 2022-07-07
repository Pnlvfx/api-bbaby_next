import config from '../../../config/config'
import TelegramBot from 'node-telegram-bot-api'

const telegramToken = config.TELEGRAM_TOKEN
const bot = new TelegramBot(telegramToken)

export const sharePostToTG = async(savedPost:any) => {
    const chat_id = savedPost
}