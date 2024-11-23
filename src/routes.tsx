import {
    Routes,
    Route,
    BrowserRouter

} from "react-router-dom"
import Login from "./pages/Login"
import Usuarios from "./pages/Usuarios"
import GerenciarUsuarios from "./pages/Usuarios/Gerenciar"
import Premios from "./pages/Premios"
import GerenciarPremios from "./pages/Premios/Gerenciar"
import Instituicao from "./pages/Instituicao"
import Historia from "./pages/Historia"
import Parceiros from "./pages/Parceiros"
import GerenciarParceiros from "./pages/Parceiros/Gerenciar"
import Colaboradores from "./pages/Colaboradores"
import GerenciarColaboradores from "./pages/Colaboradores/Gerenciar"
import Doacao from "./pages/Doacao"
import { AddModerator } from "@mui/icons-material"
import Ambientes from "./pages/Ambientes"
import Reservas from "./pages/Reservas"
import GerenciarReservas from "./pages/Reservas/Gerenciar"
import GerenciarAmbientes from "./pages/Ambientes/Gerenciar"
import GerenciarHorarios from "./pages/Ambientes/HorarioFuncionamento"

export const Rotas = () => {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <Login />
                    }
                />
                {/*<Route
                    path="/dashboard"
                    element={
                        <Voluntarios />
                    }
                />*/}
                <Route
                    path="/ambientes"
                    element={<Ambientes />}
                />
                <Route
                    path="/ambientes/:id"
                    element={<GerenciarAmbientes />}
                />
                 <Route
                    path="/horarios/:id"
                    element={<GerenciarHorarios />}
                />
                <Route
                    path="/reservas"
                    element={<Reservas />}
                />
                <Route
                    path="/reservas/:id"
                    element={<GerenciarReservas />}
                />
                <Route
                    path="/usuarios"
                    element={<Usuarios />}
                />
                <Route
                    path="/usuarios/:id"
                    element={<GerenciarUsuarios />}
                />
            </Routes>

        </BrowserRouter>
    )

}