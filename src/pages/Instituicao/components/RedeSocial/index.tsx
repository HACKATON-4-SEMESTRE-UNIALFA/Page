import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from "@mui/material/styles";
import { verificaTokenExpirado } from "../../../../services/token";
import { SnackbarMui } from "../../../../components/Snackbar";
import { Loading } from "../../../../components/Loading";
import { IToken } from "../../../../interfaces/token";

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});

const RedesBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
}));

interface IProps {
    setLoading: (val: boolean) => void
}

interface IRedeSocial {
    id: number;
    tipo: string;
    nome: string;
    url: string;
}

export const RedeSocial = ({ setLoading }: IProps) => {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();
    const { id } = useParams();


    const {
        control: redesControl,
        handleSubmit: handleRedesSubmit,
        setValue: setRedesValue,
        formState: { errors: redesErrors },
        watch,
    } = useForm<{ redes: IRedeSocial[] }>({
        defaultValues: {
            redes: [{
                id: 0,
                tipo: "",
                nome: "",
                url: ""
            }]
        }
    });

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken


    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, [setSnackbarVisible, setMessage, setSeverity]);

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
        }

        setLoading(true);

        axios.get(import.meta.env.VITE_URL + '/instituicoes/1/redes-sociais', { headers: { Authorization: `Bearer ${token.access_token}` } })	
            .then((res) => {
                setRedesValue("redes", res.data);
                setLoading(false);
            })
            .catch(() => {
                handleShowSnackbar("Erro ao carregar as Redes Sociais", "error");
                setLoading(false);
            });
    }, [navigate, setRedesValue]);

    const submitRedes: SubmitHandler<{ redes: IRedeSocial[] }> = useCallback((data) => {
        setLoading(true);

        const promises = data.redes.map(redeSocial =>
            axios.post(`${import.meta.env.VITE_URL}/instituicoes/1/redes-sociais/${redeSocial.id}`, redeSocial, { headers: { Authorization: `Bearer ${token.access_token}` } })
        );

        Promise.all(promises)
            .then(() => {
                handleShowSnackbar("Redes Sociais atualizadas com sucesso", "success");
                setLoading(false);
            })
            .catch((error) => {
                handleShowSnackbar(error.response?.data || "Erro ao salvar as Redes Sociais", "error");
                setLoading(false);
            });
    }, [handleShowSnackbar]);

    const watchRedes = watch("redes");

    return (
        <>
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
            <StyledPaper elevation={3}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>Redes Sociais</Typography>

                <Box component="form" onSubmit={handleRedesSubmit(submitRedes)}>
                    {watchRedes?.map((redeSocial, index) => (
                        <RedesBox key={redeSocial.id} sx={{ p: 1.5 }}>
                            <Typography variant="body1" sx={{ mb: 1.5, pl: 0.5 }}>
                                <strong>{redeSocial.nome}</strong>
                            </Typography>

                            <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 12 }} >
                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`redes.${index}.tipo`}
                                        control={redesControl}
                                        rules={{ required: "O tipo é obrigatório" }}
                                        render={({ field }) => (
                                            <FormControl fullWidth size="small" error={!!redesErrors?.redes?.[index]?.tipo}>
                                                <InputLabel>Rede Social</InputLabel>
                                                <Select
                                                    {...field}
                                                    label="Rede Social"
                                                    placeholder="Tipo de Rede Social"
                                                >
                                                    <MenuItem value="">Tipo de Rede Social</MenuItem>
                                                    <MenuItem value="Instagram">Instagram</MenuItem>
                                                    <MenuItem value="Facebook">Facebook</MenuItem>
                                                    <MenuItem value="Twitter">Twitter</MenuItem>
                                                    <MenuItem value="Whatsapp">Whatsapp</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`redes.${index}.nome`}
                                        control={redesControl}
                                        rules={{ required: "O nome é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                size="small"
                                                label="Nome"
                                                placeholder="Nome do Perfil"
                                                error={!!redesErrors?.redes?.[index]?.nome}
                                                helperText={redesErrors?.redes?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`redes.${index}.url`}
                                        control={redesControl}
                                        rules={{ required: "A URL é obrigatória" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                sx={{ mb: 0 }}
                                                label="URL ou @"
                                                size="small"
                                                placeholder="URL ou @"
                                                error={!!redesErrors?.redes?.[index]?.url}
                                                helperText={redesErrors?.redes?.[index]?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </RedesBox>
                    ))}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{ mt: 4 }}
                    >
                        Salvar Redes Sociais
                    </Button>
                </Box>
            </StyledPaper>
        </>
    )
}
