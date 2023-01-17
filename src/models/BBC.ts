import {Schema, model} from "mongoose";
import { ExternalNews } from "../@types/external-news";

const BBCSchema = new Schema<ExternalNews>({
    title: {
        type: String,
        required: true,
    },
    date: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    image_source: {
        type: String,
    },
    permalink: {
        type: String,
        required: true,
        unique: true
    },
    original_link: {
        type: String,
        required: true,
        unique: true
    },
    notified: {
        type: Boolean
    }
}
);
const BBC = model('BBC', BBCSchema);

export default BBC;