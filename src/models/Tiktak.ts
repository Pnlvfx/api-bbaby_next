import {Schema, model} from "mongoose";
import { TiktakProps } from "./types/tiktak";

const TiktakSchema = new Schema<TiktakProps>({
    original_body: {
        type: String,
        required: true,
        unique: true
    },
    body: {
        type: String,
        required: true,
        unique: true
    },
    permalink: {
        type: String,
        required: true,
        unique: true
    },
    audio: {
        type: String
    },
    duration: {
        type: Number
    },
    background_video: {
        type: String
    },
    images: [{
        path: String,
        loop: Number
    }],
    audios: [String],
    video: {
        type: String
    }
},
{
    timestamps: true
}
);
const Tiktak = model('Tiktak', TiktakSchema);

export default Tiktak;