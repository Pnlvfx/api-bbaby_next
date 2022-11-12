import {Schema, model} from "mongoose";

const BBCSchema = new Schema<ExternalNews>({
    title: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
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
}
);
const BBC = model('BBC', BBCSchema);

export default BBC;