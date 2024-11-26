import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, useForm } from "react-hook-form";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import "dayjs/locale/pt-br";
import dayjs, { Dayjs } from "dayjs";
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
import { ptBR } from "@mui/x-date-pickers/locales";

interface IReserva {
    id: number;
    id_ambiente: string;
    horario: string;
    data: string;
    usuario_id: number;
}

interface IAmbiente {
    id: number;
    nome: string;
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
    marginBottom: "1rem",
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
            id_ambiente: "",
            horario: "",
            data: "",
        },
    });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const [ambientes, setAmbientes] = useState<Array<IAmbiente>>([]);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [disableDates, setDisableDates] = useState<string[]>([]);
    const [blacklistDates, setBlacklistDates] = useState<string[]>([]);
    const [whitelistDates, setWhitelistDates] = useState<string[]>([]);
    const [horarioSalvo, setHorarioSalvo] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams();
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const token = JSON.parse(localStorage.getItem("auth.token") || "") as IToken;

    const handleShowSnackbar = (msg: string, sev: "success" | "error" | "info" | "warning") => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const fetchBlackList = useCallback(async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_URL}/blacklist/`,
                { headers: { Authorization: `Bearer ${token.accessToken}` } }
            );
            setBlacklistDates(response.data.blackList || []);
        } catch (err: any) {
            setError(err.message);
        }
    }, [token.accessToken]);

    const fetchWhiteList = useCallback(async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_URL}/whitelist/`,
                { headers: { Authorization: `Bearer ${token.accessToken}` } }
            );
            setWhitelistDates(response.data.whiteList || []);
        } catch (err: any) {
            setError(err.message);
        }
    }, [token.accessToken]);

    const getDisabledDates = useCallback(() => {
        const today = dayjs();
        const disabledDatesSet = new Set<string>();

        for (let i = 0; i < 31; i++) {
            const date = today.add(i, "day");
            if (date.day() === 0 || date.day() === 6) {
                disabledDatesSet.add(date.format("YYYY-MM-DD"));
            }
        }

        blacklistDates.forEach((date) => {
            const dateObj = dayjs(date);
            disabledDatesSet.add(dateObj.format("YYYY-MM-DD"));
        });

        whitelistDates.forEach((date) => {
            const dateObj = dayjs(date);
            disabledDatesSet.delete(dateObj.format("YYYY-MM-DD"));
        });

        setDisableDates(Array.from(disabledDatesSet));
    }, [blacklistDates, whitelistDates]);

    const fetchAvailableTimes = useCallback(
        async (date: string) => {
            setLoading(true);
            setError(null);

            const idAmbiente = getValues("id_ambiente");

            try {
                const response = await axios.get<IHorarioResponse>(
                    `${import.meta.env.VITE_URL}/verificaReservaHorario/${idAmbiente}/${date}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token.accessToken}`,
                        },
                    }
                );
                const horariosArray = Object.values(response.data.horariosDisponiveis);
                setAvailableTimes(horariosArray);
            } catch (err) {
                console.error("Erro ao buscar horários disponíveis:", err);
                setError("Erro ao carregar horários disponíveis");
            } finally {
                setLoading(false);
            }
        },
        [getValues, token.accessToken]
    );

    const handleDateChange = useCallback(
        (newDate: any) => {
            setSelectedDate(newDate);
            setSelectedTime(null);
            if (newDate) {
                fetchAvailableTimes(dayjs(newDate).format("YYYY-MM-DD"));
            }
        },
        [fetchAvailableTimes]
    );

    const handleAmbienteChange = useCallback(
        (id: string) => {
            setLoading(true);
            if (!id) {
                return setLoading(false);
            }
            axios
                .get(`${import.meta.env.VITE_URL}/verificaReservaDia/${id}`, {
                    headers: { Authorization: `Bearer ${token.accessToken}` },
                })
                .then((res) => {
                    const diasOcupados = res.data.diasOcupados || [];
                    setDisableDates((prevDates) => [...prevDates, ...diasOcupados]);
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    setLoading(false);
                });
        },
        [setDisableDates, token.accessToken]
    );

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        axios
            .get(import.meta.env.VITE_URL + "/ambiente/disponivel", {
                headers: { Authorization: `Bearer ${token.accessToken}` },
            })
            .then((res) => {
                setAmbientes(res.data.ambientes);
            })
            .catch(() => handleShowSnackbar("Erro ao buscar ambientes", "error"));

        fetchBlackList();
        fetchWhiteList();
        getDisabledDates();

        const reservaId = Number(id);
        if (!isNaN(reservaId)) {
            setLoading(true);
            axios
                .get(`${import.meta.env.VITE_URL}/reservas/${reservaId}`, {
                    headers: { Authorization: `Bearer ${token.accessToken}` },
                })
                .then((res) => {
                    const reservaData = res.data.reserva;
                    setIsEdit(true);
                    setValue("id", reservaData.id || 0);
                    setValue("id_ambiente", reservaData.id_ambiente || "");
                    setValue("horario", reservaData.horario || "");
                    setValue("data", reservaData.data || "");
                    setSelectedDate(reservaData.data ? dayjs(reservaData.data) : null);
                    fetchAvailableTimes(reservaData.data);
                    setHorarioSalvo(reservaData.horario || "");
                    handleAmbienteChange(reservaData.id_ambiente);
                    setLoading(false);
                })
                .catch((err) => {
                    handleShowSnackbar(err.response.data.message, "error");
                    setLoading(false);
                });
        }
    }, [id, navigate, setValue, fetchBlackList, fetchWhiteList, getDisabledDates]);

    function submitForm(data: IReserva): void {
        setLoading(true);
        const url = isEdit
            ? `${import.meta.env.VITE_URL}/reservas/${data.id}`
            : `${import.meta.env.VITE_URL}/reservas`;
        const method = isEdit ? "PUT" : "POST";

        const requestData = {
            id_ambiente: Number(data.id_ambiente),
            data: dayjs(selectedDate).format("YYYY-MM-DD"),
            horario: data.horario,
            usuario_id: token.usuario.isAdmin,
        };

        axios({
            url,
            method,
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
            data: requestData,
        })
            .then(() => {
                handleShowSnackbar(`Reserva ${isEdit ? "atualizada" : "cadastrada"} com sucesso!`, "success");
                setTimeout(() => navigate("/reservas"), 3000);
            })
            .catch((err) => {
                console.error(err);
                handleShowSnackbar(err.response.data.message, "error");
            })
            .finally(() => setLoading(false));
    }

    return (
        <LayoutDashboard>
            <Container>
                {loading && <Loading />}
                {!loading && (
                    <Box>
                        <StyledPaper>
                            <Typography variant="h4" component="h1" gutterBottom>
                                {isEdit ? "Editar Reserva" : "Nova Reserva"}
                            </Typography>
                            <Divider />
                            <form onSubmit={handleSubmit(submitForm)}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel id="ambiente-select-label">Ambiente</InputLabel>
                                    <Controller
                                        name="id_ambiente"
                                        control={control}
                                        rules={{ required: "Selecione um ambiente" }}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                labelId="ambiente-select-label"
                                                onChange={(e) => {
                                                    field.onChange(e.target.value);
                                                    handleAmbienteChange(e.target.value as string);
                                                }}
                                            >
                                                {ambientes.map((ambiente) => (
                                                    <MenuItem key={ambiente.id} value={ambiente.id}>
                                                        {ambiente.nome}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    {errors.id_ambiente && (
                                        <FormHelperText error>{errors.id_ambiente.message}</FormHelperText>
                                    )}
                                </FormControl>

                                <FormControl fullWidth margin="normal">
                                    <LocalizationProvider
                                        dateAdapter={AdapterDayjs}
                                        adapterLocale="pt-br"
                                        localeText={ptBR.components.MuiLocalizationProvider.defaultProps.localeText}
                                    >
                                        <StaticDatePicker
                                            disablePast
                                            shouldDisableDate={(date) => disableDates.includes(dayjs(date).format("YYYY-MM-DD"))}
                                            value={selectedDate}
                                            onChange={handleDateChange}
                                        />
                                    </LocalizationProvider>
                                </FormControl>

                                {availableTimes.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            Horários Disponíveis
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {availableTimes.map((time) => (
                                                <Grid size={{ xs: 6, sm: 6, md: 4 }} key={time}>
                                                    <Button
                                                        variant={selectedTime === time ? "contained" : "outlined"}
                                                        fullWidth
                                                        startIcon={<AccessTimeIcon />}
                                                        onClick={() => {
                                                            setValue("horario", time);
                                                            setSelectedTime(time);
                                                        }}
                                                    >
                                                        {time}
                                                    </Button>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                <Box mt={4}>
                                    <Button variant="contained" type="submit" fullWidth>
                                        {isEdit ? "Atualizar Reserva" : "Salvar Reserva"}
                                    </Button>
                                </Box>
                            </form>
                        </StyledPaper>
                    </Box>
                )}
            </Container>
            <SnackbarMui
                open={snackbarVisible}
                message={message}
                severity={severity}
                onClose={() => setSnackbarVisible(false)}
            />
        </LayoutDashboard>
    );
}
