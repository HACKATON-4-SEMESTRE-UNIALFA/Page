import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { verificaTokenExpirado } from "../../services/token";
import { Loading } from "../../components/Loading";
import axios from "axios";
import {
    Typography,
    Card,
    CardContent,
    Grid2 as Grid,
    Box,
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

// Define types for better type safety
interface ReservaData {
    dia: string;
    Confirmadas: number;
    Ativas: number;
    Canceladas: number;
}

interface AmbienteStatusData {
    name: string;
    value: number;
}

export default function Dashboard() {
    const [dadosReservas, setDadosReservas] = useState<number>(0);
    const [dadosAmbientes, setDadosAmbientes] = useState<number>(0);
    const [ambienteStatusData, setAmbienteStatusData] = useState<AmbienteStatusData[]>([]);
    const [loading, setLoading] = useState(true);
    const [reservasData, setReservasData] = useState<ReservaData[]>([]);

    const navigate = useNavigate();

    const COLORS_AMBIENTE = ["#4caf50", "#f44336", "#ff9800"];

    const fetchInitialData = useCallback(async () => {
        try {
            const token: IToken = JSON.parse(localStorage.getItem("auth.token") || "{}");

            // Check token
            if (!token.accessToken || verificaTokenExpirado()) {
                navigate("/");
                return;
            }

            // Fetch environment status
            const ambientesResponse = await axios.get(`${import.meta.env.VITE_URL}/relatorio/ambientes/status`, {
                headers: { Authorization: `Bearer ${token.accessToken}` }
            });

            const statusData: AmbienteStatusData[] = [
                { name: 'Disponíveis', value: ambientesResponse.data.disponiveis },
                { name: 'Manutenção', value: ambientesResponse.data.manutencao },
                { name: 'Indisponíveis', value: ambientesResponse.data.indisponiveis }
            ];

            setAmbienteStatusData(statusData);
            setDadosAmbientes(ambientesResponse.data.total);

            // Fetch reservations data
            const reservasResponse = await axios.get(`${import.meta.env.VITE_URL}/reservas`, {
                headers: { Authorization: `Bearer ${token.accessToken}` }
            });

            setDadosReservas(reservasResponse.data.reserva.length);

            // Optionally, you might want to fetch the reservations data dynamically
            // For now, keeping the hardcoded data
            const mockReservasData: ReservaData[] = [
                { dia: "Segunda", Confirmadas: 5, Ativas: 3, Canceladas: 2 },
                { dia: "Terça", Confirmadas: 6, Ativas: 4, Canceladas: 1 },
                { dia: "Quarta", Confirmadas: 7, Ativas: 5, Canceladas: 0 },
                { dia: "Quinta", Confirmadas: 8, Ativas: 2, Canceladas: 3 },
                { dia: "Sexta", Confirmadas: 10, Ativas: 1, Canceladas: 1 },
                { dia: "Sábado", Confirmadas: 12, Ativas: 0, Canceladas: 4 },
                { dia: "Domingo", Confirmadas: 9, Ativas: 2, Canceladas: 2 },
            ];
            setReservasData(mockReservasData);

            setLoading(false);
        } catch (error) {
            setLoading(false);
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    if (loading) return <Loading visible={true} />;

    return (
        <LayoutDashboard>
            <Grid container spacing={3} sx={{ mt: 3 }}>
                {/* Totals */}
                <Grid size={{ xs: 12, sm: 6 }} 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2, 
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Card sx={{ width: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" align="center">
                                Total de Ambientes: {dadosAmbientes}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ width: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" align="center">
                                Quantidade de Reservas: {dadosReservas}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pie Chart */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Status dos Ambientes
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={ambienteStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius="80%"
                                        fill="#8884d8"
                                        label
                                        labelLine={false}
                                    >
                                        {ambienteStatusData.map((entry, index) => (
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
                </Grid>

                {/* Bar Chart */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
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
                </Grid>
            </Grid>
        </LayoutDashboard>
    );
}