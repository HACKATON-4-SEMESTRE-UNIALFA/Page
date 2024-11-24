import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import 'dayjs/locale/pt-br';
import dayjs, { Dayjs } from 'dayjs';
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
    TextField,
    Typography,
    Paper,
    Divider,
    Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import { LayoutDashboard } from "../../../components/LayoutDashboard";
import { SnackbarMui } from "../../../components/Snackbar";
import DropZone from "../../../components/Dropzone";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";
import { ptBR } from '@mui/x-date-pickers/locales';
import { get, is } from "immutable";

interface IReserva {
    id: number
    id_ambiente: string
    horario: string
    data: string
    usuario_id: number
}

interface IAmbiente {
    id: number
    nome: string
}

interface IHorarioResponse {
    data: string;
    horariosDisponiveis: { [key: string]: string };
    nomeAmbiente: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});


export default function GerenciarReservas() {
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<IReserva>({
        defaultValues: {
            id: 0,
            id_ambiente: '',
            horario: '',
            data: ''
        }
    });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [ambientes, setAmbientes] = useState<Array<IAmbiente>>([])
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [disableDates, setDisableDates] = useState<string[]>([]);



    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken


    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        // Busca ambientes
        axios.get(import.meta.env.VITE_URL + '/ambientes?status=Disponível', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                setAmbientes(res.data.ambiente);
            })
            .catch(() => handleShowSnackbar("Erro ao buscar ambientes", "error"))

        const reservaId = Number(id);
        if (!isNaN(reservaId)) {
            setLoading(true);
            axios.get(import.meta.env.VITE_URL + `/reservas/${reservaId}`, { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    const reservaData = res.data.reserva;
                    setIsEdit(true);
                    setValue("id", reservaData.id || 0);
                    setValue("id_ambiente", reservaData.id_ambiente || '');
                    setValue("horario", reservaData.horario || '');
                    setValue("data", reservaData.data || '');
                    setSelectedDate(reservaData.data ? dayjs(reservaData.data) : null);
                    fetchAvailableTimes(reservaData.data);
                    setSelectedTime(reservaData.horario || null);
                    setLoading(false)
                })
                .catch((err) => {
                    handleShowSnackbar(err.response.data.message, 'error');
                    setLoading(false)
                })
        }
    }, [id, navigate, setValue]);

    const getDisabledDates = useCallback((diasBloqueados: string[] = []) => {
        const today = dayjs();
        const disabledDates: string[] = [];

        // Adiciona os finais de semana (sábados e domingos)
        for (let i = 0; i < 31; i++) {
            const date = today.add(i, 'day');
            if (date.day() === 0 || date.day() === 6) {
                disabledDates.push(date.format('YYYY-MM-DD'));
            }
        }

        // Combina as datas dos finais de semana com as datas bloqueadas da API
        const allDisabledDates = [...new Set([...disabledDates, ...diasBloqueados])]; // Remove duplicatas
        setDisableDates(allDisabledDates);
    }, [setDisableDates]);

    const handleAmbienteChange = useCallback((id: any) => {
        setLoading(true);
        if (!id) {
            return setLoading(false);
        }

        // Realiza a requisição para buscar os dias bloqueados do ambiente
        axios.get(import.meta.env.VITE_URL + `/verificaReservaDia/${id}`, { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                // Supondo que 'res.data.horario' seja um array de datas bloqueadas
                const diasBloqueados = res.data.diasOcupados || [];

                // Combine as datas bloqueadas do ambiente com as datas dos finais de semana
                getDisabledDates(diasBloqueados); // Passa as datas bloqueadas para a função de gerar finais de semana
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, [setDisableDates, getDisabledDates]);

    function submitForm(data: IReserva): void {
        setLoading(true);
        console.log(data)
        // Configurar a URL e o método da requisição
        const url = isEdit
            ? `${import.meta.env.VITE_URL}/reservas/${data.id}`
            : `${import.meta.env.VITE_URL}/reservas`;
        const method = isEdit ? 'PUT' : 'POST';

        // Montar os dados para a requisição
        const requestData = isEdit
            ? {
                id_ambiente: data.id_ambiente,
                horario: data.horario,
                data: dayjs(data.data).format('YYYY-MM-DD'),
                id_alteracao: token.usuario.id, // ID do usuário atual
            }
            : {
                id_usuario: token.usuario.id, // ID do usuário atual criando a reserva
                id_ambiente: data.id_ambiente,
                horario: data.horario,
                data: dayjs(data.data).format('YYYY-MM-DD'),
            };

        // Fazer a requisição
        axios({
            method,
            url,
            headers: { Authorization: `Bearer ${token.accessToken}` },
            data: requestData,
        })
            .then((response) => {
                handleShowSnackbar(isEdit ? 'Reserva atualizada com sucesso!' : 'Reserva criada com sucesso!', 'success');
                navigate('/reservas'); // Redireciona para a lista de reservas
            })
            .catch((error) => {
                console.error('Erro ao processar a requisição:', error);
                const errorMsg = error.response?.data?.message || 'Ocorreu um erro ao salvar os dados.';
                handleShowSnackbar(errorMsg, 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const fetchAvailableTimes = useCallback(async (date: string) => {
        setLoading(true);
        setError(null);

        const idAmbiente = getValues('id_ambiente');

        try {
            const response = await axios.get<IHorarioResponse>(
                `${import.meta.env.VITE_URL}/verificaReservaHorario/${idAmbiente}/${date}`,
                {
                    headers: {
                        Authorization: `Bearer ${token.accessToken}`
                    }
                }
            );
            const horariosArray = Object.values(response.data.horariosDisponiveis);
            setAvailableTimes(horariosArray);

        } catch (err) {
            console.error('Erro ao buscar horários disponíveis:', err);
            setError('Erro ao carregar horários disponíveis');
        } finally {
            setLoading(false);
        }
    }, [getValues, token.accessToken]);

    // Fun o para lidar com a sele o de uma data
    const handleDateChange = useCallback(
        (newDate: any) => {
            setSelectedDate(newDate);
            setSelectedTime(null); // Reseta o horário selecionado
            if (newDate) {
                fetchAvailableTimes(dayjs(newDate).format('YYYY-MM-DD')); // Formato YYYY-MM-DD
            }
        },
        [fetchAvailableTimes, setSelectedDate, setSelectedTime]
    );

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
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
                            {isEdit ? "Editar Reserva" : "Adicionar Reserva"}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>

                            <Controller
                                name="id_ambiente"
                                control={control}
                                rules={{ required: 'Ambiente é obrigatório!' }}
                                render={({ field }) => (
                                    <FormControl
                                        fullWidth
                                        error={!!errors.id_ambiente}
                                        sx={{ mb: 2 }}
                                    >
                                        <InputLabel>Ambientes Disponíveis</InputLabel>
                                        <Select
                                            {...field}
                                            label="Ambientes Disponíveis"
                                            onChange={(e) => {
                                                field.onChange(e); // Atualiza o valor no formulário
                                                handleAmbienteChange(e.target.value); // Chama a função para atualizar a lógica de ambientes
                                            }}
                                        >
                                            <MenuItem value="">Selecione o Ambiente</MenuItem>
                                            {ambientes.map((ambiente) => (
                                                <MenuItem key={ambiente.id} value={ambiente.id}>{ambiente.nome}</MenuItem>
                                            ))}
                                        </Select>
                                        {errors && (
                                            <FormHelperText>{errors?.id_ambiente?.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Divider >
                                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                                    Escolha uma data
                                </Typography>
                            </Divider>

                            <LocalizationProvider
                                dateAdapter={AdapterDayjs}
                                adapterLocale="pt-br"
                                localeText={ptBR.components.MuiLocalizationProvider.defaultProps.localeText}
                            >
                                <Controller
                                    name="data"
                                    control={control}
                                    render={({ field }) => (
                                        <StaticDatePicker
                                            {...field}
                                            orientation="landscape"
                                            displayStaticWrapperAs="desktop" // Mantém o DatePicker estático
                                            value={selectedDate}
                                            disablePast
                                            minDate={dayjs().add(1, 'day')}
                                            maxDate={dayjs().add(30, 'day')}
                                            onChange={(date) => {
                                                field.onChange(date);
                                                handleDateChange(date);
                                            }}
                                            shouldDisableDate={(date: Dayjs) => {
                                                return disableDates.includes(date.format('YYYY-MM-DD'));
                                            }}
                                        />
                                    )}
                                />
                            </LocalizationProvider>

                            {isEdit && (
                                <Box sx={{ mb: 5, justifyContent: 'center', display: 'flex' }}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            px: 3,
                                            py: 1.5,
                                            backgroundColor: 'primary.main',
                                            borderRadius: 2
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            <AccessTimeIcon
                                                sx={{
                                                    color: 'white',
                                                    fontSize: '1.5rem'
                                                }}
                                            />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: 'white',
                                                    fontWeight: 500,
                                                    lineHeight: 1
                                                }}
                                            >
                                                {selectedTime ? (
                                                    <>
                                                        Horário Atual:&nbsp;
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {selectedTime}
                                                        </Box>
                                                    </>
                                                ) : ''}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Box>
                            )}

                            <Divider sx={{ mt: 0, mb: 2, color: 'black' }} >
                                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
                                    {availableTimes.length > 0 ? 'Horários disponíveis' : ''}
                                </Typography>
                            </Divider>

                            <Controller
                                name="horario"
                                control={control}
                                rules={{ required: 'Selecionar uma data e um horário é obrigatório!' }}
                                render={({ field, fieldState: { error } }) => (
                                    <>
                                        {availableTimes.length > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, justifyContent: 'center', maxWidth: '70%' }}>
                                                    <Grid container spacing={2} justifyContent="center">
                                                        {availableTimes.map((time, index) => (
                                                            <Grid size={{ xs: 6, sm: 6, md: 4 }} key={`${time}-${index}`}>
                                                                <Button
                                                                    variant="outlined"
                                                                    sx={{
                                                                        backgroundColor: field.value === time ? 'primary.main' : 'transparent',
                                                                        color: field.value === time ? 'common.white' : 'primary.main',
                                                                        '&:hover': {
                                                                            backgroundColor: field.value === time ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                                                                        }
                                                                    }}
                                                                    onClick={() => field.onChange(time)}
                                                                    fullWidth
                                                                >
                                                                    {time}
                                                                </Button>
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </Box>
                                            </Box>
                                        )}
                                        {error && (
                                            <FormHelperText error sx={{ mb: 2, textAlign: 'center', color: 'red' }}>
                                                {error.message}
                                            </FormHelperText>
                                        )}
                                    </>
                                )}
                            />

                            <Box sx={{ display: { xs: 'block', md: 'flex' }, justifyContent: 'center', gap: 2, mt: 2 }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    color="secondary"
                                    size="large"
                                    onClick={() => navigate('/reservas')}
                                    sx={{ mt: 1, mb: 1, width: { xs: '100%', md: '50%' } }}
                                >
                                    Voltar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    sx={{ mt: 1, mb: 1, width: { xs: '100%', md: '50%' } }}
                                >
                                    Salvar
                                </Button>
                            </Box>
                        </Box>
                    </StyledPaper>
                </Container>
            </LayoutDashboard >
        </>
    );
}


