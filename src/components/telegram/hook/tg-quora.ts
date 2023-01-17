import { catchError } from "../../../coraline/cor-route/crlerror"
import { ConversationState } from "../telegramCtrl"

const tgquora = {
    handle: async (msg: TelegramMessage, conversationState: ConversationState) => {
        try {
            
        } catch (err) {
            throw catchError(err);
        }
    }
}

export default tgquora