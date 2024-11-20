export interface IToken {
    accessToken: string
    user: {
        id: number
        nome: string
        email: string
        isAdmin: boolean,
        isUser: boolean
    }
}