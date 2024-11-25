export interface IToken {
    accessToken: string
    usuario: {
        id: number
        nome: string
        email: string
        isAdmin: boolean,
        isUser: boolean
    }
}