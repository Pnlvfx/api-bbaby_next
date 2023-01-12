interface BotCommands {
    command: string
    description: string
}

interface SendPhotoOptions {
    caption?: string
    protect_content?: boolean
    allow_sending_without_reply?: boolean
    disable_notification?: boolean
    parse_mode?: string
    reply_markup?: any
    reply_to_message_id?: number
}