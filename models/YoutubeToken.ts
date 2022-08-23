import {Schema,model} from "mongoose";

const YoutubeTokenSchema = new Schema({
    token : {
        type: {
            access_token: {
                type: String,
                require: true,
            },
            expires_in : {
                type: Number,
                required: true
            },
            scope: {
                type: String,
                required: true
            },
            token_type: {
                type: String,
                required: true,
            },
            required: true,
            expires: 3600
        },
    },
},
);
const YoutubeToken = model('YoutubeToken', YoutubeTokenSchema);

export default YoutubeToken;