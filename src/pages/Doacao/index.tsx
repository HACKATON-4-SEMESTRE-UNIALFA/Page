import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
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
import { SnackbarMui } from "../../components/Snackbar";
import { Loading } from "../../components/Loading";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { IToken } from "../../interfaces/token";
import { verificaTokenExpirado } from "../../services/token";

interface IDadosBancarios {
    id: number
    banco: string
    agencia: string
    conta_corrente: string
    cnpj: string
    titular: string
    chave_pix: string
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});


export default function Doacao() {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<IDadosBancarios>({
        defaultValues: {
            banco: '',
            agencia: '',
            conta_corrente: '',
            cnpj: '',
            titular: '',
            chave_pix: ''
        }
    });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
        }

        const doacaoId = Number(id);
        setLoading(true);
        axios.get(import.meta.env.VITE_URL + `/doacoes/${doacaoId}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
            .then((res) => {    
                const doacoes = res.data;
                setValue("banco", doacoes.banco || '');
                setValue("agencia", doacoes.agencia || '');
                setValue("conta_corrente", doacoes.conta_corrente || '');
                setValue("cnpj", doacoes.cnpj || '');
                setValue("titular", doacoes.titular || '');
                setValue("chave_pix", doacoes.chave_pix || '');
                setLoading(false)
            })
            .catch((err) => {
                handleShowSnackbar("Erro ao obter dados bancários", "error");
                setLoading(false)
            })
    }, [id, navigate, setValue]);

    const submitDadosBancarios: SubmitHandler<IDadosBancarios> = useCallback((data) => {
        setLoading(true);
        axios.post(import.meta.env.VITE_URL + `/doacoes/${id}`, data, { headers: { Authorization: `Bearer ${token.access_token}` } })
            .then(() => {
                handleShowSnackbar("Dados bancários editadas com sucesso", "success");
                setLoading(false)
            })
            .catch((error) => {
                handleShowSnackbar(error.response.data, 'error')
                setLoading(false)
            });
    }, [handleShowSnackbar]);

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
            <Loading visible={loading} />
            <LayoutDashboard>
                <Container maxWidth="md">
                    <StyledPaper elevation={3}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
                            Dados Bancários
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit(submitDadosBancarios)} noValidate>
                            <Controller
                                name="banco"
                                control={control}
                                rules={{
                                    required: "O Banco é obrigatório",
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Nome"
                                        error={!!errors.banco}
                                        helperText={errors.banco?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="agencia"
                                control={control}
                                rules={{
                                    required: "A Agência é obrigatória",
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="agencia"
                                        error={!!errors.agencia}
                                        helperText={errors.agencia?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="conta_corrente"
                                control={control}
                                rules={{
                                    required: "A Conta Corrente é obrigatória",
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="conta_corrente"
                                        error={!!errors.conta_corrente}
                                        helperText={errors.conta_corrente?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="cnpj"
                                control={control}
                                rules={{
                                    required: "O CPF ou CNPJ é obrigatório",
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="CPF ou CNPJ do titular"
                                        error={!!errors.cnpj}
                                        helperText={errors.cnpj?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="titular"
                                control={control}
                                rules={{
                                    required: "O Titular é obrigatório",
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Nome do titular"
                                        error={!!errors.titular}
                                        helperText={errors.titular?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="chave_pix"
                                control={control}
                                rules={{
                                    required: "A chave PIX é obrigatória",
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Chave PIX"
                                        error={!!errors.chave_pix}
                                        helperText={errors.chave_pix?.message}
                                    />
                                )}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                size="large"
                            >
                                Salvar Dados Bancários
                            </Button>
                        </Box>
                    </StyledPaper>
                </Container>
            </LayoutDashboard>
        </>
    )
}


