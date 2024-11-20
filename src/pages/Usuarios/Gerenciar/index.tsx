import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
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
import { LayoutDashboard } from "../../../components/LayoutDashboard";
import { SnackbarMui } from "../../../components/Snackbar";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";

interface IForm {
    nome: string;
    email: string;
    perfil: string;
    senha: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/

export default function GerenciarUsuarios() {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<IForm>({
        defaultValues: {
            nome: '',
            email: '',
            perfil: '',
            senha: ''
        }
    });

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

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
            return;
        }

        const idUser = Number(id);
        if (!isNaN(idUser)) {
            setLoading(true);
            axios.get(import.meta.env.VITE_URL + `/usuarios/${idUser}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
                .then((res) => {
                    const userData = res.data.data;
                    setIsEdit(true);
                    setValue("nome", userData.nome || '');
                    setValue("email", userData.email || '');
                    setValue("perfil", userData.permissoes || '');
                })
                .catch((error) => {
                    handleShowSnackbar(error.response.data, 'error')
                })
                .finally(() => setLoading(false));
        }
    }, [id, navigate, setValue]);

    const submitForm: SubmitHandler<IForm> = useCallback((data) => {
        setLoading(true);
        const request = isEdit
            ? axios.post(import.meta.env.VITE_URL + `/usuarios/${id}`, data, { headers: { Authorization: `Bearer ${token.access_token}` } })
            : axios.post(import.meta.env.VITE_URL + '/usuarios/', data, { headers: { Authorization: `Bearer ${token.access_token}` } })

        request
            .then(() => {
                handleShowSnackbar(
                    isEdit
                        ? 'Usuário editado com sucesso!'
                        : 'Usuário adicionado com sucesso!',
                    'success'
                );
                setTimeout(() => { navigate('/usuarios') }, 1500)
            })
            .catch((error) => {
                handleShowSnackbar(error.response.data, 'error')
            })
            .finally(() => setLoading(false));
    }, [isEdit, id, navigate]);

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
                            {isEdit ? "Editar Usuário" : "Adicionar Usuário"}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
                            <Controller
                                name="nome"
                                control={control}
                                rules={{
                                    required: 'Nome é obrigatório!',
                                    pattern: {
                                        value: nameRegex,
                                        message: 'O nome não pode conter números'
                                    }
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Nome"
                                        error={!!errors.nome}
                                        helperText={errors.nome?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="email"
                                control={control}
                                rules={{
                                    required: 'Email é obrigatório!',
                                    pattern: {
                                        value: emailRegex,
                                        message: 'Email inválido. Deve conter um domínio válido (ex: usuario@dominio.com)'
                                    }
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="perfil"
                                control={control}
                                rules={{ required: 'Perfil é obrigatório!' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.perfil} sx={{ mb: 2 }}>
                                        <InputLabel>Perfil</InputLabel>
                                        <Select {...field} label="Perfil">
                                            <MenuItem value="">Selecione o tipo</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="colaborador">Colaborador</MenuItem>
                                        </Select>
                                        {errors.perfil && (
                                            <FormHelperText>{errors.perfil.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="senha"
                                control={control}
                                rules={{
                                    required: 'Senha é obrigatória!',
                                    pattern: {
                                        value: passwordRegex,
                                        message: 'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial'
                                    }
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Senha"
                                        type="password"
                                        error={!!errors.senha}
                                        helperText={errors.senha?.message}
                                    />
                                )}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
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