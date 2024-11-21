import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import { LayoutDashboard } from "../../../components/LayoutDashboard";
import { SnackbarMui } from "../../../components/Snackbar";
import DropZone from "../../../components/Dropzone";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";
import { ptBR } from '@mui/x-date-pickers/locales';

interface IReserva {
    id: number
    ambiente_id: string
    horario: string
    data: string
    usuario_id: number
}

interface IAmbiente {
    id: number
    nome: string
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
            ambiente_id: '',
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
        axios.get(import.meta.env.VITE_URL + '/ambientes', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                setAmbientes(res.data);
            })
            .catch(() => handleShowSnackbar("Erro ao buscar ambientes", "error"))

        const reservaId = Number(id);
        if (!isNaN(reservaId)) {
            setLoading(true);
            /*axios.get(import.meta.env.VITE_URL + `/reservas/${reservaId}`, { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    const premioData = res.data;
                    setIsEdit(true);
                    setValue("id", premioData.id || 0);
                    setValue("nome", premioData.nome || '');
                    setValue("categoria", premioData.categoria || '');
                    setValue("data_recebimento", premioData.data_recebimento || '');

                    setLoading(false)
                })
                .catch((err) => {
                    handleShowSnackbar(err.response.data.message, 'error');
                    setLoading(false)
                })*/
        }
    }, [id, navigate, setValue]);

    function submitForm(data: IReserva, event?: BaseSyntheticEvent<object, any, any> | undefined): unknown {
        throw new Error("Function not implemented.");
    }

    /*const submitForm: SubmitHandler<IReserva> = useCallback((data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('id', data.id?.toString() || '');
        formData.append('nome', data.nome);
        formData.append('categoria', data.categoria);
        formData.append('data_recebimento', data.data_recebimento);
        formData.append('imagem', data.imagem || '');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token.accessToken}`,
            }
        };

        const url = isEdit
            ? `${import.meta.env.VITE_URL}/premios/${id}`
            : `${import.meta.env.VITE_URL}/premios/`;

        const request = isEdit
            ? axios.post(url, formData, config)
            : axios.post(url, formData, config);

        request
            .then((response) => {
                handleShowSnackbar(
                    isEdit
                        ? 'Prêmio editado com sucesso!'
                        : 'Prêmio adicionado com sucesso!',
                    'success'
                );
                setLoading(false);
                setTimeout(() => { navigate('/premios'); }, 1500);
            })
            .catch((error) => {
                const errorMessage = error.response?.data || 'Erro ao processar a requisição';
                setLoading(false);
                handleShowSnackbar(errorMessage, 'error');
            });
    }, [isEdit, id, navigate]);*/

    const fetchAvailableTimes = async (date) => {
        setLoading(true);
        setError(null);
        try {
            // Simulando uma chamada à API
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulando horários disponíveis - substitua pela sua chamada real à API
            const mockTimes = [
                '09:00-09:59',
                '10:00-10:59',
                '11:00-11:59',
                '14:00-14:59',
                '15:00-15:59',
                '16:00-16:59'
            ];

            setAvailableTimes(mockTimes);
        } catch (err) {
            console.error('Erro ao buscar horários disponíveis:', err);
        } finally {
            setLoading(false);
        }
    };

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

    const disabledDates = [
        // Feriados nacionais
        new Date('2024-01-01'), // Ano Novo
        new Date('2024-04-21'), // Tiradentes
        new Date('2024-05-01'), // Dia do Trabalho
        new Date('2024-09-07'), // Independência do Brasil
        new Date('2024-10-12'), // Nossa Senhora Aparecida
        new Date('2024-11-02'), // Finados
        new Date('2024-11-15'), // Proclamação da República
        new Date('2024-12-25'), // Natal

        // Feriados facultativos
        new Date('2024-02-12'), // Carnaval
        new Date('2024-02-13'), // Carnaval
        new Date('2024-02-14'), // Quarta-feira de Cinzas

        // Datas específicas de exemplo
        new Date('2024-07-20'), // Data de exemplo
        new Date('2024-08-15'), // Outra data de exemplo

        // Exemplo de intervalo de férias
        new Date('2024-12-20'),
        new Date('2024-12-21'),
        new Date('2024-12-22'),
        new Date('2024-12-23'),
        new Date('2024-12-24'),
        new Date('2024-12-25'),
        new Date('2024-12-26'),
        new Date('2024-12-27'),
        new Date('2024-12-28'),
        new Date('2024-12-29'),
        new Date('2024-12-30'),
        new Date('2024-12-31')
    ];





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
                                name="ambiente_id"
                                control={control}
                                rules={{ required: 'Ambiente é obrigatório!' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.ambiente_id} sx={{ mb: 2 }}>
                                        <InputLabel>Ambiente</InputLabel>
                                        <Select {...field} label="Ambiente">
                                            <MenuItem value="">Selecione o Ambiente</MenuItem>
                                            {ambientes.map((ambiente) => (
                                                <MenuItem key={ambiente.id} value={ambiente.id}>{ambiente.nome}</MenuItem>
                                            ))}
                                        </Select>
                                        {errors && (
                                            <FormHelperText>{errors?.ambiente_id?.message}</FormHelperText>
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
                                            maxDate={dayjs().add(30, 'day')}
                                            onChange={(date) => {
                                                field.onChange(date);
                                                handleDateChange(date);
                                            }}
                                            shouldDisableDate={(date: Dayjs) => {
                                                // Datas específicas para desabilitar
                                                const disabledDates = [
                                                    '2024-12-25',
                                                    '2024-12-29'
                                                ];
                                                return disabledDates.includes(date.format('YYYY-MM-DD'));
                                            }}
                                        />
                                    )}
                                />
                            </LocalizationProvider>

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
                                                    {availableTimes.map((time) => (
                                                        <Grid key={time} size={{ xs: 6, sm: 6, md: 3 }}>
                                                            <Button
                                                                key={time}
                                                                size="large"
                                                                variant={field.value === time ? 'contained' : 'outlined'}
                                                                color={field.value === time ? 'primary' : 'info'}
                                                                onClick={() => field.onChange(time)}
                                                                fullWidth
                                                            >
                                                                {time}
                                                            </Button>
                                                        </Grid>
                                                    ))}
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

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                sx={{ mt: 2 }}
                            >
                                Salvar
                            </Button>
                        </Box>
                    </StyledPaper>
                </Container>
            </LayoutDashboard >
        </>
    );
}
