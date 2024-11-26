import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { verificaTokenExpirado } from "../../services/token";
import { Loading } from "../../components/Loading";
import axios from "axios";
import {
    Typography,
    Card,
    CardContent,
    Grid2 as MuiGrid,
} from "@mui/material";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { IToken } from "../../interfaces/token";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

export default function Dashboard() {
    const [dadosUsuarios, setDadosUsuarios] = useState<Array<any>>([]);
    const [dadosAmbientes, setDadosAmbientes] = useState<Array<any>>([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const ambienteData = [
        { name: "Disponível", value: 1 },
        { name: "Manutenção", value: 1 },
    ];

   

    const reservasData = [
        { dia: "Segunda", Confirmadas: 5, Ativas: 3, Canceladas: 2 },
        { dia: "Terça", Confirmadas: 6, Ativas: 4, Canceladas: 1 },
        { dia: "Quarta", Confirmadas: 7, Ativas: 5, Canceladas: 0 },
        { dia: "Quinta", Confirmadas: 8, Ativas: 2, Canceladas: 3 },
        { dia: "Sexta", Confirmadas: 10, Ativas: 1, Canceladas: 1 },
        { dia: "Sábado", Confirmadas: 12, Ativas: 0, Canceladas: 4 },
        { dia: "Domingo", Confirmadas: 9, Ativas: 2, Canceladas: 2 },
    ];

    const COLORS_AMBIENTE = ["#4caf50", "#f44336"];

    const token = JSON.parse(localStorage.getItem("auth.token") || "") as IToken;

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
        }

        setLoading(true);

        axios
            .get(import.meta.env.VITE_URL + "/reservas", {
                headers: { Authorization: `Bearer ${token.accessToken}` },
            })
            .then((res) => {
                setDadosUsuarios(res.data.usuario);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });

        axios
            .get(import.meta.env.VITE_URL + "/ambientes", {
                headers: { Authorization: `Bearer ${token.accessToken}` },
            })
            .then((res) => {
                setDadosAmbientes(res.data.ambiente);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Loading visible={loading} />
            <LayoutDashboard>
                <MuiGrid container spacing={3} sx={{ mt: 3 }}>
                    {/* Totais */}
                    <MuiGrid size={{xs: 12, sm: 6}} alignItems={"center"} display={"flex"} flexDirection={"column"} gap={5} justifyContent={"center"}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">Total de Ambientes: {dadosAmbientes.length}</Typography>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <Typography variant="h5">Quantidade de Reservas: {dadosAmbientes.length}</Typography>
                            </CardContent>
                        </Card>
                    </MuiGrid>

                    {/* Gráficos de Pizza */}
                    <MuiGrid size={{xs: 12, sm: 6}}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Status dos Ambientes</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={ambienteData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label
                                        >
                                            {ambienteData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={COLORS_AMBIENTE[index % COLORS_AMBIENTE.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </MuiGrid>

                    {/* Gráfico de Barras */}
                    <MuiGrid size={{ xs: 12 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    Quantidade de Reservas por Status - Semana Atual
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={reservasData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="dia" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Confirmadas" fill="#12b518" name="Confirmadas" />
                                        <Bar dataKey="Ativas" fill="#006eff" name="Ativas" />
                                        <Bar dataKey="Canceladas" fill="#f44336" name="Canceladas" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </MuiGrid>
                </MuiGrid>
            </LayoutDashboard>
        </>
    );
}

