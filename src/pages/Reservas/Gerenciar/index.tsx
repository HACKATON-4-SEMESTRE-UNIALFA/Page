import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';



import dayjs from 'dayjs';


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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { LayoutDashboard } from "../../../components/LayoutDashboard";
import { SnackbarMui } from "../../../components/Snackbar";
import DropZone from "../../../components/Dropzone";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";
import { ptBR } from "@mui/material/locale";

interface IReserva {
    id: number
    ambiente_id: number
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
            ambiente_id: 0,
            horario: '',
            data: ''
        }
    });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [ambientes, setAmbientes] = useState<Map<number, string>>(new Map())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]); 
    const [selectedTime, setSelectedTime] = useState(null);


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
                const ambienteMap = new Map<number, string>()
                res.data.forEach((ambiente: IAmbiente) => {
                    ambienteMap.set(ambiente.id, ambiente.nome)
                })
                setAmbientes(ambienteMap)
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
            setSelectedTime(null); // Reseta o hor rio selecionado
            if (newDate) {
                fetchAvailableTimes(newDate.toISOString().split('T')[0]); // Formato YYYY-MM-DD
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
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
                            {isEdit ? "Editar Reserva" : "Adicionar Reserva"}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>

                            <Controller
                                name="ambiente_id"
                                control={control}
                                rules={{ required: 'Ambiente é obrigatório!' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.ambiente_id} sx={{ mb: 2 }}>
                                        <InputLabel>Ambientes</InputLabel>
                                        <Select {...field} label="Amientes">
                                            <MenuItem value="">Selecione o Ambiente</MenuItem>
                                            {Array.from(ambientes.entries()).map(([key, value]) => (
                                                <MenuItem key={key} value={key}>{value}</MenuItem>
                                            ))}
                                        </Select>
                                        {errors.ambiente_id && (
                                            <FormHelperText>{errors.ambiente_id.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="data"
                                control={control}
                                render={({ field }) => (
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                        adapterLocale={'pt-br'}
                                        /*localeText={ptBR?.components?.MuiLocalizationProvider?.defaultProps.localeText}*/
                                    >
                                        <StaticDatePicker
                                            {...field}
                                            orientation="landscape"
                                            displayStaticWrapperAs="desktop" // Mantém o DatePicker estático
                                            value={selectedDate}
                                            disablePast
                                            onChange={handleDateChange}
                                        />
                                    </LocalizationProvider>
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
            </LayoutDashboard>
        </>
    );
}
