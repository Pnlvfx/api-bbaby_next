export interface VideoProps {
    public_id: string
    version: number
    width: number
    height: number
    format: 'mp4'
    resource_type: 'video'
    created_at: string
    bytes?: number
    placeholder?: boolean
    url: string
    folder: string,
    frame_rate?: number,
    duration?: number
}