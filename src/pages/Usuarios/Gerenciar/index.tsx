import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import InputMask from "react-input-mask";

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
import { is } from "immutable";

interface IForm {
    nome: string;
    email: string;
    password: string;
    confirmaSenha: string;
    cpf: string;
    telefone: string;
    isAdmin: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

const tiposDeUsuarios = [
    { value: "admin", label: "Administrador" },
    { value: "colaborador", label: "Colaborador" },
];

export default function GerenciarUsuarios() {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<IForm>({
        defaultValues: {
            nome: '',
            email: '',
            password: '',
            confirmaSenha: '',
            cpf: '',
            telefone: '',
            isAdmin: '',
        },
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

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken;

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        const idUser = Number(id);
        if (!isNaN(idUser)) {
            setLoading(true);
            axios
                .get(import.meta.env.VITE_URL + `/usuarios/${idUser}`, { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    const userData = res.data.usuario;
                    setIsEdit(true);
                    setValue("nome", userData.nome || '');
                    setValue("email", userData.email || '');
                    setValue("cpf", userData.cpf || '');
                    setValue("telefone", userData.telefone || '');
                    console.log(userData);
                    setValue("isAdmin", userData.isAdmin || '');
                })
                .catch((error) => {
                    handleShowSnackbar(error.response.data, 'error');
                })
                .finally(() => setLoading(false));
        }
    }, [id, navigate, setValue]);

    const submitForm: SubmitHandler<IForm> = useCallback((data) => {
        setLoading(true);
        const request = isEdit
            ? axios.put(import.meta.env.VITE_URL + `/usuarios/${id}`, data, { headers: { Authorization: `Bearer ${token.accessToken}` } })
            : axios.post(import.meta.env.VITE_URL + '/usuarios/', data, { headers: { Authorization: `Bearer ${token.accessToken}` } });

        request
            .then(() => {
                handleShowSnackbar(
                    isEdit
                        ? 'Usuário editado com sucesso!'
                        : 'Usuário adicionado com sucesso!',
                    'success'
                );
                setTimeout(() => { navigate('/usuarios'); }, 1500);
            })
            .catch((error) => {
                console.error(error);
                handleShowSnackbar(error.response.data, 'error');
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
                        horizontal: 'center',
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
                                    required: 'O nome é obrigatório.',
                                    pattern: {
                                        value: nameRegex,
                                        message: 'O nome deve conter apenas letras e espaços.',
                                    },
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
                                    required: 'O email é obrigatório.',
                                    pattern: {
                                        value: emailRegex,
                                        message: 'Insira um email válido. Exemplo: usuario@dominio.com',
                                    },
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
                                name="isAdmin"
                                control={control}
                                rules={{
                                    required: 'O perfil é obrigatório.',
                                }}

                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.isAdmin} sx={{ mb: 2 }}>
                                        <InputLabel>Perfil</InputLabel>
                                        <Select {...field} label="Perfil">
                                            <MenuItem value="">Selecione o tipo</MenuItem>
                                            <MenuItem value="0">Usuario</MenuItem>
                                            <MenuItem value="1">Admin</MenuItem>
                                        </Select>
                                        {errors.isAdmin && (
                                            <FormHelperText>{errors.isAdmin.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="password"
                                control={control}
                                rules={{
                                    required: 'A senha é obrigatória.',
                                    pattern: {
                                        value: passwordRegex,
                                        message: 'A senha deve conter 8+ caracteres, uma maiúscula, um número e um símbolo.',
                                    },
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Senha"
                                        type="password"
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="confirmaSenha"
                                control={control}
                                rules={{
                                    required: 'A confirmação de senha é obrigatória.',
                                    validate: (value) =>
                                        value === watch('password') || 'As senhas não coincidem.',
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Confirme sua Senha"
                                        type="password"
                                        error={!!errors.confirmaSenha}
                                        helperText={errors.confirmaSenha?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="cpf"
                                control={control}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="CPF"
                                        value={field.value || ''}
                                        InputProps={{
                                            readOnly: isEdit,
                                        }}
                                        error={!!errors.cpf}
                                        helperText={errors.cpf?.message}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                )}
                            />
                            <Controller
                                name="telefone"
                                control={control}
                                rules={{
                                    required: 'O telefone é obrigatório.',
                                    maxLength: 11,
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Telefone"
                                        error={!!errors.telefone}
                                        helperText={errors.telefone?.message}
                                        inputProps={{
                                            maxLength: 11,
                                            inputMode: 'numeric', // Sugere um teclado numérico
                                            pattern: '[0-9]*', // Garante que apenas números sejam aceitos
                                        }}
                                        onKeyPress={(e) => {
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault(); // Bloqueia a digitação de letras e caracteres especiais
                                            }
                                        }}
                                    />
                                )}
                            />


                            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                                {isEdit ? "Atualizar" : "Cadastrar"}
                            </Button>

                            <Button
                                onClick={() => navigate('/usuarios')}
                                variant="outlined"
                                fullWidth
                                size="large"
                                color="error"
                            >
                                Voltar
                            </Button>

                        </Box>
                    </StyledPaper>
                </Container>
            </LayoutDashboard>
        </>
    );
}
