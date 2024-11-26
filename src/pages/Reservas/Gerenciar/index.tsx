import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, useForm } from "react-hook-form";
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
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";
import { ptBR } from '@mui/x-date-pickers/locales';

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
    const [blacklistDates, setBlacklistDates] = useState<string[]>([]);
    const [whitelistDates, setWhitelistDates] = useState<string[]>([]);
    const [horarioSalvo, setHorarioSalvo] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken;

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };


    const getDisabledDates = useCallback(() => {
        const today = dayjs();
        const disabledDatesSet = new Set<string>();

        // Adiciona os finais de semana
        for (let i = 0; i < 31; i++) {
            const date = today.add(i, 'day');
            if (date.day() === 0 || date.day() === 6) {
                disabledDatesSet.add(date.format('YYYY-MM-DD'));
            }
        }

        // Adiciona blacklist
        blacklistDates.forEach(date => {
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            disabledDatesSet.add(formattedDate);
        });

        // Remove whitelist (prioridade da whitelist)
        whitelistDates.forEach(date => {
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            if (disabledDatesSet.has(formattedDate)) {
                disabledDatesSet.delete(formattedDate);
            }
        });

        setDisableDates(Array.from(disabledDatesSet));
    }, []);

    const fetchBlackAndWhiteLists = useCallback(async () => {
        try {
            const [blacklistResponse, whitelistResponse] = await Promise.all([
                axios.get(`${import.meta.env.VITE_URL}/blacklist/`, {
                    headers: { Authorization: `Bearer ${token.accessToken}` }
                }),
                axios.get(`${import.meta.env.VITE_URL}/whitelist/`, {
                    headers: { Authorization: `Bearer ${token.accessToken}` }
                })
            ]);

            setBlacklistDates(
                blacklistResponse.data.blackList.data
                    ? blacklistResponse.data.blackList.map(
                        (item: { data: string }) => item.data
                    )
                    : []
            );
            setWhitelistDates(
                whitelistResponse.data.whiteList.data
                    ? whitelistResponse.data.whiteList.map(
                        (item: { data: string }) => item.data
                    )
                    : []
            );

            getDisabledDates();
        } catch (err: any) {
            setError(err.message);
        }
    }, [getDisabledDates, blacklistDates, whitelistDates]);



    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }


        // Busca ambientes
        axios.get(import.meta.env.VITE_URL + '/ambiente/disponivel', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                setAmbientes(res.data.ambientes);
            })
            .catch(() => handleShowSnackbar("Erro ao buscar ambientes", "error"));

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
                    setHorarioSalvo(reservaData.horario || '');
                    handleAmbienteChange(reservaData.id_ambiente);
                    setLoading(false)
                })
                .catch((err) => {
                    handleShowSnackbar(err.response.data.message, 'error');
                    setLoading(false)
                })
        }
    }, [id, navigate, setValue, getDisabledDates]);

    const handleAmbienteChange = useCallback((id: string) => {
        // Se não houver ID, não faz nada
        if (!id) return;

        // Carrega datas ocupadas específicas do ambiente
        setLoading(true);
        axios.get(import.meta.env.VITE_URL + `/verificaReservaDia/${id}`, {
            headers: { Authorization: `Bearer ${token.accessToken}` }
        })
            .then((res) => {
                const diasOcupados = res.data.diasOcupados || [];

                // Combina as datas ocupadas com as datas desabilitadas existentes
                const combinedDisabledDates = [...new Set([...disableDates, ...diasOcupados])];
                setDisableDates(combinedDisabledDates);

                // Recalcula datas desabilitadas considerando whitelist
                getDisabledDates();
            })
            .catch((err) => {
                ('Erro ao verificar dias ocupados:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [
        setDisableDates,
        disableDates,
        getDisabledDates
    ]);


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
            ('Erro ao buscar horários disponíveis:', err);
            setError('Erro ao carregar horários disponíveis');
        } finally {
            setLoading(false);
        }
    }, [getValues]);

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

    function submitForm(data: IReserva): void {
        setLoading(true);
        // [Código de submissão do formulário igual ao original]
        const url = isEdit
            ? `${import.meta.env.VITE_URL}/reservas/${data.id}`
            : `${import.meta.env.VITE_URL}/reservas`;
        const method = isEdit ? 'PUT' : 'POST';

        const requestData = isEdit
            ? {
                id_ambiente: data.id_ambiente,
                horario: data.horario,
                data: dayjs(data.data).format('YYYY-MM-DD'),
                id_alteracao: token.usuario.id,
            }
            : {
                id_usuario: token.usuario.id,
                id_ambiente: data.id_ambiente,
                horario: data.horario,
                data: dayjs(data.data).format('YYYY-MM-DD'),
            };

        axios({
            method,
            url,
            headers: { Authorization: `Bearer ${token.accessToken}` },
            data: requestData,
        })
            .then((response) => {
                handleShowSnackbar(isEdit ? 'Reserva atualizada com sucesso!' : 'Reserva criada com sucesso!', 'success');
                navigate('/reservas');
            })
            .catch((error) => {
                ('Erro ao processar a requisição:', error);
                const errorMsg = error.response?.data?.message || 'Ocorreu um erro ao salvar os dados.';
                handleShowSnackbar(errorMsg, 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    }

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
                                                field.onChange(e);
                                                handleAmbienteChange(e.target.value);
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

                            {/* Restante do componente igual ao original */}
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
                                            displayStaticWrapperAs="desktop"
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
                                                {horarioSalvo ? (
                                                    <>
                                                        Horário Atual:&nbsp;
                                                        <Box
                                                            component="span"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {horarioSalvo}
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
                                                                    onClick={() => { field.onChange(time) }}
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
                                    color="error"
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


