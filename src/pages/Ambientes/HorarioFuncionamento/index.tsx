import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, set, SubmitHandler, useForm } from "react-hook-form";
import { useLocation } from 'react-router-dom';

import axios from "axios";

import {
    Box,
    Button,
    Container,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Paper,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    Grid2 as Grid,
    Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { LayoutDashboard } from "../../../components/LayoutDashboard";
import { SnackbarMui } from "../../../components/Snackbar";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";

interface IHorarioFuncionamento {
    id: number;
    id_ambiente: string;
    horarios: string[];
}

interface IHorarioResponse {
    id: number;
    id_ambiente: number;
    horario: string;
}

interface IAmbiente {
    id: number;
    nome: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    maxHeight: '400px',
    overflow: 'auto'
}));

const TimeSlotGrid = styled(Grid)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: theme.spacing(1),
    padding: theme.spacing(2),
}));

// Generate time slots from 00:00 to 23:00
const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < 24; i++) {
        const startHour = i.toString().padStart(2, '0');
        const endHour = ((i + 1) % 24).toString().padStart(2, '0');
        slots.push(`${startHour}:00-${endHour}:00`);
    }
    return slots;
};

export default function GerenciarHorarios() {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<IHorarioFuncionamento>({
        defaultValues: {
            id: 0,
            id_ambiente: '',
            horarios: []
        }
    });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [ambientes, setAmbientes] = useState<IAmbiente | null>(null);
    const [selectedHorarios, setSelectedHorarios] = useState<string[]>([]);
    const [selectAllHorarios, setSelectAllHorarios] = useState(false);

    const timeSlots = generateTimeSlots();

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken;
    const location = useLocation();

    const handleSelectAllHorarios = (checked: boolean) => {
        setSelectAllHorarios(checked);
        const newHorarios = checked ? timeSlots : [];
        setSelectedHorarios(newHorarios);
        setValue("horarios", newHorarios);
    };

    const handleHorarioChange = (horario: string, checked: boolean) => {
        const newSelectedHorarios = checked
            ? [...selectedHorarios, horario]
            : selectedHorarios.filter(h => h !== horario);

        setSelectedHorarios(newSelectedHorarios);
        setValue("horarios", newSelectedHorarios);
        setSelectAllHorarios(newSelectedHorarios.length === timeSlots.length);
    };

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        if (location.state?.snackbarMessage) {
            setMessage(location.state.snackbarMessage);
            setSeverity(location.state.snackbarSeverity);
            setSnackbarVisible(true);
        }

        const ambienteId = Number(id);
        if (!isNaN(ambienteId)) {
            // Busca ambientes
            setLoading(true);

            axios.get(import.meta.env.VITE_URL + '/ambientes/' + ambienteId, { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    setAmbientes(res.data.ambiente);
                    setValue("id_ambiente", res.data.ambiente.id.toString());
                })
                .catch((err) => {
                    (err);
                    handleShowSnackbar("Erro ao buscar Ambiente", "error")
                    setTimeout(() => {
                        setLoading(false);
                        navigate('/ambientes');
                    }, 1500);
                })

            axios.get(import.meta.env.VITE_URL + `/horarios/ambiente/${ambienteId}`, {
                headers: { Authorization: `Bearer ${token.accessToken}` }
            })
                .then((res) => {
                    const horarioData = res.data as IHorarioResponse[];
                    setIsEdit(true);

                    if (horarioData.length > 0) {
                        // Extract just the horario strings from the response
                        const horarios = horarioData.map(item => item.horario);
                        setSelectedHorarios(horarios);
                        setValue("horarios", horarios);
                        setSelectAllHorarios(horarios.length === timeSlots.length);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    handleShowSnackbar(err.response.data.message, 'error');
                    setLoading(false);
                });
        }
    }, [id, navigate, setValue]);

    const submitForm: SubmitHandler<IHorarioFuncionamento> = useCallback(async (data) => {
        setLoading(true);

        const config = {
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token.accessToken}`,
            }
        };

        try {
            if (isEdit) {

                const existingResponse = await axios.get(

                    `${import.meta.env.VITE_URL}/horarios/ambiente/${id}`, config

                );

                const existingHorarios = existingResponse.data.horario as IHorarioResponse[];

                // Find horários to remove and add
                const existingHorarioStrings = existingHorarios.map(h => h.horario);
                const horariosToAdd = selectedHorarios.filter(h => !existingHorarioStrings.includes(h));
                const horariosToRemove = existingHorarios.filter(h => !selectedHorarios.includes(h.horario));

                // Remove unselected horários
                await Promise.all(
                    horariosToRemove.map(horario => axios.delete(

                            `${import.meta.env.VITE_URL}/horarios/${horario.id}`,config
                        )
                    )
                );

                // Add new horários
                await Promise.all(
                    horariosToAdd.map(horario => axios.post(`${import.meta.env.VITE_URL}/horarios`,
                            {
                                id_ambiente: data.id_ambiente,
                                horario: horario
                            },
                            config
                        )
                    )
                );

            } else {
                // For new entries, create individual requests for each horário
                await Promise.all(
                    selectedHorarios.map(horario =>
                        axios.post(
                            `${import.meta.env.VITE_URL}/horarios`,
                            {
                                id_ambiente: data.id_ambiente,
                                horario: horario
                            },
                            config
                        )
                    )
                );
            }

            handleShowSnackbar(
                isEdit
                    ? 'Horários editados com sucesso!'
                    : 'Horários adicionados com sucesso!',
                'success'
            );
            setLoading(false);
            setTimeout(() => { navigate('/ambientes'); }, 1500);

        } catch (error: any) {
            (error);
            const errorMessage = error.response?.data?.message || 'Erro ao processar a requisição';
            setLoading(false);
            handleShowSnackbar(errorMessage, 'error');
        }
    }, [isEdit, id, navigate, selectedHorarios, token.accessToken]);

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
                <Container maxWidth="md">
                    <StyledPaper elevation={3}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
                            {isEdit ? "Editar Horários" : "Adicionar Horários"}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
                            <Controller
                                name="id_ambiente"
                                control={control}
                                rules={{ required: "Selecione um ambiente" }}
                                render={({ field }) => (
                                    <FormControl
                                        fullWidth
                                        sx={{ mb: 2 }}
                                        error={!!errors.id_ambiente}
                                    >
                                        <InputLabel>Ambiente</InputLabel>
                                        <Select
                                            {...field}
                                            label="Ambiente"
                                        >
                                            <MenuItem value={ambientes?.id}>{ambientes?.nome}</MenuItem>
                                        </Select>
                                        {errors.id_ambiente && (
                                            <FormHelperText>{errors.id_ambiente.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="horarios"
                                control={control}
                                rules={{ required: "Selecione pelo menos um horário" }}
                                render={({ field }) => (
                                    <FormControl
                                        fullWidth
                                        error={!!errors.horarios}
                                        component="fieldset"
                                        sx={{ mb: 2 }}
                                    >
                                        <Divider >
                                            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                                                Escolha os Horários
                                            </Typography>
                                        </Divider>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectAllHorarios}
                                                    onChange={(e) => handleSelectAllHorarios(e.target.checked)}
                                                />
                                            }
                                            label="Selecionar Todos"
                                            sx={{ mb: 1 }}
                                        />
                                        <StyledCard>
                                            <CardContent sx={{ padding: 0 }}>
                                                <TimeSlotGrid sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                    {timeSlots.map((horario) => (
                                                        <FormControlLabel
                                                            key={horario}
                                                            control={
                                                                <Checkbox
                                                                    checked={selectedHorarios.includes(horario)}
                                                                    onChange={(e) => handleHorarioChange(horario, e.target.checked)}
                                                                />
                                                            }
                                                            label={horario}
                                                        />
                                                    ))}
                                                </TimeSlotGrid>
                                            </CardContent>
                                        </StyledCard>
                                        {errors.horarios && (
                                            <FormHelperText>{errors.horarios.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />
                            <Box sx={{ textAlign: 'center', mt: 2 }}>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="large"
                                    sx={{ mt: 2, width: '45%', mr: 1 }}
                                    onClick={() => navigate(-2)}
                                >
                                    Voltar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"

                                    size="large"
                                    sx={{ mt: 2, width: '45%' }}
                                >
                                    Salvar
                                </Button>

                            </Box>
                        </Box>
                    </StyledPaper>
                </Container>
            </LayoutDashboard>
        </>
    );
}
