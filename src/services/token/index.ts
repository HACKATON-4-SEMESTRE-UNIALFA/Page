import { jwtDecode } from "jwt-decode"
import { IToken } from "../../interfaces/token"

export const verificaTokenExpirado = () => {
    let lsStorage = localStorage.getItem('auth.token')

    let token: IToken | null = null

    if (typeof lsStorage === 'string') {
        token = JSON.parse(lsStorage)
    }

    if (token) {
        let decodedToken = jwtDecode(token.accessToken)
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