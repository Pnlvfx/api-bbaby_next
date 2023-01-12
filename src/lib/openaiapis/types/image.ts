interface AImageResponse {
    created: number,
    data: AiImage[]
}

type AiImage = {
    url: string
}