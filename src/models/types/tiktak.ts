import { Document } from "mongoose";

export interface TiktakProps extends Document {
    original_body: string
    body: string
    permalink: string
    audio: string
    duration: number
    background_video: string
    images: FFmpegImage[]
    audios: string[]
    video: string
    synthetize: string
}