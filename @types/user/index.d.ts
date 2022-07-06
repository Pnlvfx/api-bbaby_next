interface IUser {
    email: string
    username: string
    password: string
    role: number
    avatar: string
    country: string
    countryCode: string
    city: string
    region: string
    lat: string
    lon: string
    upVotes: [Types.ObjectId]
    downVotes: [Types.ObjectId]
    tokens: {}
    hasExternalAccount: boolean
    externalAccounts: {}
    subscribed: [string]
}