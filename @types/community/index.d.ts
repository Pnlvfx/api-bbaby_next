interface CommunityProps {
    name:string
    communityAvatar: string
    cover: string
    communityAuthor: string
    description: string
    acceptFollowers: boolean
    subscribers: number
    user_is_moderator: boolean
    user_is_banned: boolean
    user_is_contributor: boolean
    user_is_subscriber: boolean
    number_of_posts: number
    language: string
    categories: string[]
}