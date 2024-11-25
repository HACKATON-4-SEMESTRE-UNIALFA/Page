import {
    Routes,
    Route,
    BrowserRouter,
    Navigate

} from "react-router-dom"
import Login from "./pages/Login"
import Usuarios from "./pages/Usuarios"
import GerenciarUsuarios from "./pages/Usuarios/Gerenciar"
import Ambientes from "./pages/Ambientes"
import Reservas from "./pages/Reservas"
import GerenciarReservas from "./pages/Reservas/Gerenciar"
import GerenciarAmbientes from "./pages/Ambientes/Gerenciar"
import GerenciarHorarios from "./pages/Ambientes/HorarioFuncionamento"
import Notificacoes from "./pages/Notificacoes"
import Dashboard from "./pages/Dashboard"
import Register from "./pages/Register"
import Blacklist from "./pages/BlackList"
import WhiteList from "./pages/WhiteList"
import { IToken } from "./interfaces/token"
import PageError from "./pages/PageError"


const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken

    if (!token.usuario.isAdmin) {
        return <Navigate to="/404" />
    }

    return children
}

export const Rotas = () => {

    return (
        <BrowserRouter>

            <Routes>
                <Route
                    path="/404"
                    element={
                        <PageError />
                    }
                />
                <Route
                    path="/"
                    element={
                        <Login />
                    }
                />
                <Route
                    path="/register/"
                    element={<Register />}
                />
                <Route
                    path="/dashboard"
                    element={
                        <Dashboard />
                    }
                />
                <Route
                    path="/notificacoes"
                    element={
                        <Notificacoes />
                    }
                />
                <Route
                    path="/ambientes"
                    element={
                        <Ambientes />
                    }
                />
                <Route
                    path="/ambientes/:id"
                    element={
                        <PrivateRoute>
                            <GerenciarAmbientes />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/horarios/:id"
                    element={
                        <PrivateRoute>
                            <GerenciarHorarios />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/reservas"
                    element={
                        <Reservas />
                    }
                />
                <Route
                    path="/reservas/:id"
                    element={
                        <PrivateRoute>
                            <GerenciarReservas />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/calendario/blacklist"
                    element={
                        <PrivateRoute>
                            <Blacklist />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/calendario/whitelist"
                    element={
                        <PrivateRoute>
                            <WhiteList />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/usuarios"
                    element={
                        <PrivateRoute>
                            <Usuarios />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/usuarios/:id"
                    element={
                        <PrivateRoute>
                            <GerenciarUsuarios />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    )

}
