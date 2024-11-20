import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
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

interface IEndereco {
    id: number;
    local: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});

const AddressBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
}));

interface IProps {
    setLoading: (val: boolean) => void
}

export const Endereco = ({ setLoading }: IProps) => {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();
    const { id } = useParams();


    const {
        control: locaisControl,
        handleSubmit: handleLocaisSubmit,
        setValue: setLocaisValue,
        formState: { errors: locaisErrors },
        watch,
    } = useForm<{ locais: IEndereco[] }>({
        defaultValues: {
            locais: [{
                id: 0,
                local: "",
                logradouro: "",
                numero: "",
                complemento: "",
                bairro: "",
                cidade: "",
                estado: "",
                cep: "",
            }]
        }
    });

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

        axios.get(import.meta.env.VITE_URL + `/instituicoes/1/enderecos/`, { headers: { Authorization: `Bearer ${token.access_token}` } })
            .then((res) => {
                setLocaisValue("locais", res.data);
                setLoading(false);
            })
            .catch((err) => {
                handleShowSnackbar("Erro ao carregar endereços", "error");
                setLoading(false);
            });
    }, [navigate, setLocaisValue]);

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken

    const submitLocais: SubmitHandler<{ locais: IEndereco[] }> = useCallback((data) => {
        setLoading(true);

        const promises = data.locais.map(endereco =>
            axios.post(`${import.meta.env.VITE_URL}/instituicoes/1/enderecos/${endereco.id}`, endereco, { headers: { Authorization: `Bearer ${token.access_token}` } })
        );

        Promise.all(promises)
            .then(() => {
                handleShowSnackbar("Endereços atualizados com sucesso", "success");
                setLoading(false);
            })
            .catch((error) => {
                handleShowSnackbar(error.response?.data || "Erro ao salvar endereços", "error");
                setLoading(false);
            });
    }, [handleShowSnackbar]);

    const onCepBlur = useCallback(async (cep: string, index: number) => {
        if (cep.length === 8) {
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                const { logradouro, complemento, bairro, localidade, uf } = response.data;

                setLocaisValue(`locais.${index}.logradouro`, logradouro);
                setLocaisValue(`locais.${index}.complemento`, complemento);
                setLocaisValue(`locais.${index}.bairro`, bairro);
                setLocaisValue(`locais.${index}.cidade`, localidade);
                setLocaisValue(`locais.${index}.estado`, uf);
                setLocaisValue(`locais.${index}.cep`, cep);
            } catch (error) {
                handleShowSnackbar("CEP inválido", "error");
            }
        }
    }, [setLocaisValue]);

    const watchLocais = watch("locais");

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
                <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>Endereços</Typography>

                <Box component="form" onSubmit={handleLocaisSubmit(submitLocais)} noValidate>
                    {watchLocais.map((local, index) => (
                        <AddressBox key={index}>
                            <Typography variant="body1" sx={{ mb: 3, pl: 0.5 }}>
                                <strong>{`${local.local}`}</strong>
                            </Typography>

                            <Grid container spacing={1} columns={{ xs: 4, sm: 8, md: 12 }}>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.cep`}
                                        control={locaisControl}
                                        rules={{ required: "O CEP é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                onBlur={() => onCepBlur(field.value, index)}
                                                fullWidth
                                                size="small"
                                                label="CEP"
                                                placeholder="00000-000"
                                                error={!!locaisErrors.locais?.[index]?.cep}
                                                helperText={locaisErrors?.locais?.[index]?.cep?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.logradouro`}
                                        control={locaisControl}
                                        rules={{ required: "O Logradouro é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                size="small"
                                                label="Logradouro"
                                                placeholder="Rua, Av. ou outros"
                                                error={!!locaisErrors.locais?.[index]?.logradouro}
                                                helperText={locaisErrors?.locais?.[index]?.logradouro?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.numero`}
                                        control={locaisControl}
                                        rules={{ required: "O número é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                size="small"
                                                label="Nº"
                                                placeholder="Ex: 123 ou 0 em caso de sem nº"
                                                error={!!locaisErrors.locais?.[index]?.numero}
                                                helperText={locaisErrors?.locais?.[index]?.numero?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.complemento`}
                                        control={locaisControl}
                                        rules={{ required: "O complemento é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                size="small"
                                                label="Complemento"
                                                placeholder="Ex: Casa, Prédio Comercial"
                                                error={!!locaisErrors.locais?.[index]?.complemento}
                                                helperText={locaisErrors?.locais?.[index]?.complemento?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.bairro`}
                                        control={locaisControl}
                                        rules={{ required: "O bairro é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                size="small"
                                                label="Bairro"
                                                placeholder="Nome do bairro"
                                                error={!!locaisErrors.locais?.[index]?.bairro}
                                                helperText={locaisErrors?.locais?.[index]?.bairro?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.cidade`}
                                        control={locaisControl}
                                        rules={{ required: "A cidade é obrigatória" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                size="small"
                                                label="Cidade"
                                                placeholder="Cidade"
                                                error={!!locaisErrors.locais?.[index]?.cidade}
                                                helperText={locaisErrors?.locais?.[index]?.cidade?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.estado`}
                                        control={locaisControl}
                                        rules={{ required: "O Estado é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                size="small"
                                                label="Estado"
                                                placeholder="UF Ex: SP"
                                                error={!!locaisErrors.locais?.[index]?.estado}
                                                helperText={locaisErrors?.locais?.[index]?.estado?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                                    <Controller
                                        name={`locais.${index}.local`}
                                        control={locaisControl}
                                        rules={{ required: "O nome do local é obrigatório" }}
                                        render={({ field }) => (
                                            <FormTextField
                                                {...field}
                                                fullWidth
                                                size="small"
                                                label="Nome do Local"
                                                placeholder="Ex: Sede, Bazar"
                                                error={!!locaisErrors.locais?.[index]?.local}
                                                helperText={locaisErrors?.locais?.[index]?.local?.message}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </AddressBox>
                    ))}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Salvar Endereços
                    </Button>
                </Box>
            </StyledPaper>
        </>
    );
};