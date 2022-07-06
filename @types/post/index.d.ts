interface PostProps {
    author: string
    authorAvatar: string
    title: string
    body: string
    image: string
    community: string
    communityIcon: string
    mediaInfo: {
        dimension: []
        isImage: boolean
    }
    imageId: string
    ups: number
    liked: string
    numComments: number
}