import {Schema,model} from "mongoose";
import { LinkPreviewProps } from "../externals/linkPreview";

const BBCSchema = new Schema<LinkPreviewProps>({
    title: {
        type: String
    },
    description: {
        type: String
    },
    full_description: {
        type: String
    },
    image: {
        type: String
    },
    hostname: {
        type: String
    },
    siteName: {
        type: String
    },
    link: {
        type: String
    }
},
{
    timestamps: true
}
);
const BBC = model('BBC', BBCSchema);

export default BBC;