import { Document } from "mongoose"

interface ExternalNews extends Document {
    title: string
    date?: string
    description: string
    image: string
    image_source?: string
    permalink: string
    original_link: string
    notified?: boolean
}