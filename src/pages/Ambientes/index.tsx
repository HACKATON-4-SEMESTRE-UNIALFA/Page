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

interface IAmbientes {
    id: 0,
    nome: string,
    descricao: string,
    imagem: File | null
}

export default function Ambientes() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosAmbientes, setDadosAmbientes] = useState<Array<IAmbientes>>([])
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

        if (location.state?.snackbarMessage) {
            setMessage(location.state.snackbarMessage);
            setSeverity(location.state.snackbarSeverity);
            setSnackbarVisible(true);
        }

        setLoading(true)

        axios.get(import.meta.env.VITE_URL + '/ambientes', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                setDadosAmbientes(res.data)
                setLoading(false)
            })
            .catch((err) => {
                setDadosAmbientes(err)
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
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Ambientes
                        </Typography>
                        <Box display="flex">
                            <Button
                                sx={{ mr: 2 }}
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/reservas/add')}
                            >
                                Reservar
                            </Button>
                            {token.user?.isAdmin == true &&
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
                        {dadosAmbientes.map((ambiente) => (
                            <Grid size={{ md: 4, sm: 6, xs: 12 }} key={ambiente.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'stretch',
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
                                        alt="green iguana"
                                        height="150"
                                        image="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
                                    />

                                    <CardContent>
                                        <Typography variant="h6" component="h2"
                                            sx={{ color: 'text.primary' }}
                                        >
                                            {ambiente.nome}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {ambiente.descricao}
                                        </Typography>
                                    </CardContent>
                                    {token.user?.isAdmin == true &&
                                        <CardActions sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                                            <Button color="primary" size="large"
                                                onClick={() => navigate(`/ambientes/${ambiente.id}`)}
                                            >
                                                Editar
                                            </Button>
                                            <Button color="error" size="large"
                                                onClick={() => removeAmbiente(ambiente.id)}
                                            >
                                                Excluir
                                            </Button>

                                        </CardActions>
                                    }
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </LayoutDashboard >
        </>
    )
}
