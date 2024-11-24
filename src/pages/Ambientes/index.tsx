import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Controller, set, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";

import {
    Box,
    Button,
    Container,
    FormControl,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputLabel,
    Card,
    CardMedia,
    CardContent,
    Chip,
    CardActions,
    Badge,
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit'
import { verificaTokenExpirado } from "../../services/token";
import { SnackbarMui } from "../../components/Snackbar";
import { Loading } from "../../components/Loading";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { ConfirmationDialog } from "../../components/Dialog";
import { IToken } from "../../interfaces/token";
import ControlPointRoundedIcon from '@mui/icons-material/ControlPointRounded';

interface IAmbientes {
    id: 0,
    nome: string,
    capacidade: number,
    status: string,
    equipamentos_disponiveis: string,
    descricao: string,
    imagem: File | null
}

interface IHorarioFuncionamento {
    id: number;
    id_ambiente: number;
    horario: string;
}

export default function Ambientes() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosAmbientes, setDadosAmbientes] = useState<Array<IAmbientes>>([])
    const [dadosHorarios, setDadosHorarios] = useState<Array<IHorarioFuncionamento>>([])

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    })
    const location = useLocation();
    const [dialogState, setDialogState] = useState({
        open: false,
        id: null as number | null
    })

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        setLoading(true)

        axios.get(import.meta.env.VITE_URL + '/ambientes', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                setDadosAmbientes(res.data.ambiente)
                setLoading(false)
            })
            .catch((err) => {
                setDadosAmbientes([])
                setLoading(false)
            })

        axios.get(import.meta.env.VITE_URL + '/horarios', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                setDadosHorarios(res.data.horarios)
                setLoading(false)
            })
            .catch((err) => {
                setDadosHorarios(err)
                setLoading(false)
            })
    }, [location])

    const removeAmbiente = useCallback((id: number) => {
        setDialogState({ open: true, id });
    }, []);

    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, [setSnackbarVisible, setMessage, setSeverity]);

    const handleConfirmedDelete = useCallback(() => {
        const id = dialogState.id;

        axios.delete(import.meta.env.VITE_URL + `/ambientes/${id}`, { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then(() => {
                handleShowSnackbar("Ambiente removido com sucesso", "success");
                setDadosAmbientes((prevRows) => prevRows.filter((row) => row.id !== id));
                setLoading(false)
            })
            .catch((error) => {
                const errorMessage = error.response?.data || "Erro ao remover Ambiente";
                setLoading(false)
                handleShowSnackbar(errorMessage, "error");
            })
    }, [dialogState.id, setLoading]);

    return (
        <>
            <Loading visible={loading} />
            <LayoutDashboard>
                <SnackbarMui
                    open={snackbarVisible}
                    message={message}
                    severity={severity}
                    onClose={() => setSnackbarVisible(false)}
                    position={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                />
                <Container maxWidth="xl" sx={{ mb: 4, mt: 3 }}>
                    <ConfirmationDialog
                        open={dialogState.open}
                        title="Confirmar exclusão"
                        message="Tem certeza que deseja excluir este Ambiente ?"
                        onConfirm={handleConfirmedDelete}
                        onClose={() => setDialogState({ open: false, id: null })}
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
                        <Typography variant="h4" component="h1">
                            Ambientes
                        </Typography>
                        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mt={{ xs: 1, md: 0 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<ControlPointRoundedIcon />}
                                onClick={() => navigate('/reservas/add')}
                            >
                                Reservar
                            </Button>
                            {token.usuario?.isAdmin == true &&
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<AddIcon />}
                                    onClick={() => navigate('/ambientes/add')}
                                >
                                    Adicionar
                                </Button>
                            }
                        </Box>
                    </Box>

                    <Grid container spacing={3}>
                        {dadosAmbientes.length == 0 ? (
                            <Typography variant="body1" component="p" align="center" mt={5}>
                                Nenhum ambiente cadastrado
                            </Typography>
                        ) : (
                            dadosAmbientes.map((ambiente) => {
                                let horariosAmbiente = [] as Array<IHorarioFuncionamento>

                                if (dadosHorarios.length > 0) {
                                    horariosAmbiente = dadosHorarios
                                        .filter((horario) => horario.id_ambiente == ambiente.id)
                                        .sort((a, b) => {
                                            const inicioA = a.horario.split('-')[0];
                                            const inicioB = b.horario.split('-')[0];
                                            return inicioA.localeCompare(inicioB);
                                        });
                                }

                                return (
                                    <Grid size={{ md: 4, sm: 6, xs: 12 }} key={ambiente.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: '0.3s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 4,
                                                },
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                alt={`Imagem do ambiente ${ambiente.nome}`}
                                                height="150"
                                                image= {`${import.meta.env.VITE_URL}/imagens/${ambiente.imagem}`}
                                            />
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
                                                        {ambiente.nome}
                                                    </Typography>
                                                    <Chip
                                                        label={ambiente.status}
                                                        color={ambiente.status === 'Disponível' ? 'success' : 'warning'}
                                                    />
                                                </Box>

                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {ambiente.descricao}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Capacidade: {ambiente.capacidade}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    Equipamentos Disponíveis: {ambiente.equipamentos_disponiveis}
                                                </Typography>

                                                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                                    Horários de Funcionamento:
                                                </Typography>
                                                {horariosAmbiente.length > 0 ? (
                                                    <Box
                                                        display="flex"
                                                        gap={1}
                                                        flexWrap="wrap"
                                                        mt={1}
                                                        sx={{
                                                            justifyContent: 'center',
                                                            '& > div': {
                                                                border: '1.5px solid',
                                                                borderColor: 'grey.400',
                                                                borderRadius: '4px',
                                                                padding: '2px 6px',
                                                                fontSize: '0.875rem',
                                                                color: 'text.primary',
                                                                transition: 'background-color 0.3s',
                                                            },
                                                        }}
                                                    >
                                                        {horariosAmbiente.map((horario) => (
                                                            <Box key={horario.id}>{horario.horario}</Box>
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        Nenhum horário disponível.
                                                    </Typography>
                                                )}
                                            </CardContent>
                                            {token.usuario?.isAdmin == true && (
                                                <CardActions
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        mt: 'auto',
                                                    }}
                                                >
                                                    <Button
                                                        color="primary"
                                                        size="large"
                                                        onClick={() => navigate(`/ambientes/${ambiente.id}`)}
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        color="error"
                                                        size="large"
                                                        onClick={() => removeAmbiente(ambiente.id)}
                                                    >
                                                        Excluir
                                                    </Button>
                                                </CardActions>
                                            )}
                                        </Card>
                                    </Grid>
                                );
                            })
                        )}
                    </Grid>

                </Container>
            </LayoutDashboard >
        </>
    )
}

