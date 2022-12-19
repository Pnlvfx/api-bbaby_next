const coralMongo = {
    regexUpperLowerCase: (name: string) => {
        return new RegExp(`^${name}$`, 'i')
    }
}

export default coralMongo;
