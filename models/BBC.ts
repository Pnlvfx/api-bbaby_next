import {Schema,model} from "mongoose";

const BBCSchema = new Schema<ExternalNews>({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        unique: true
    },
    full_description: {
        type: String
    },
    image: {
        type: String,
    },
    hostname: {
        type: String
    },
    siteName: {
        type: String
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    permalink: {
        type: String,
        required: true,
        unique: true
    }
},
{
    timestamps: true
}
);
const BBC = model('BBC', BBCSchema);

export default BBC;