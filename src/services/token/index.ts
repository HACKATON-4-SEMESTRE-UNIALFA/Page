import { jwtDecode } from "jwt-decode"
import { IToken } from "../../interfaces/token"

export const verificaTokenExpirado = () => {
    const lsStorage = localStorage.getItem('auth.token')

    let token: IToken | null = null

    if (typeof lsStorage === 'string') {
        token = JSON.parse(lsStorage)
    }

    if (token) {
        const decodedToken = jwtDecode(token.accessToken)
        if (
            !decodedToken.exp
            ||
            decodedToken.exp < new Date().getTime() / 1000
        ) {

            return true

        }
        return false
    }

}