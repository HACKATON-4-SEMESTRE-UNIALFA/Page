import { useCallback, useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Grid2 as Grid,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SnackbarMui } from '../../components/Snackbar';
import { Loading } from '../../components/Loading';

type IRegister = {
    nome: string;
    email: string;
    password: string;
    confirmaSenha: string;
    cpf: string;
    telefone: string;
    isAdmin: boolean;
};

export default function Register() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<IRegister>();

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [loading, setLoading] = useState(false);
    const nomeRegex = /^[a-zA-Z\s]{7,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{7,}$/;
    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const onSubmit = useCallback(async (data: IRegister) => {
        setLoading(true);

        try {
            const cleanData = {
                ...data,
                cpf: data.cpf.replace(/\D/g, ''),
                telefone: data.telefone.replace(/\D/g, ''),
                isAdmin: false,
                isUser: true
            };

            const response = await axios.post(`${import.meta.env.VITE_URL}/usuarios`, cleanData);

            if (response.status === 201) {
                handleShowSnackbar('Registro efetuado com sucesso!', 'success');
                setTimeout(() => navigate('/'), 1500);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);

            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const { errors } = error.response.data;
                const cpfError = errors.cpf?.[0];
                const emailError = errors.email?.[0];

                if (cpfError) handleShowSnackbar(cpfError, 'error');
                if (emailError) handleShowSnackbar(emailError, 'error');
            } else {
                handleShowSnackbar('Erro desconhecido ao registrar usuário!', 'error');
            }
        }
    }, [navigate, handleShowSnackbar]);

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        },
        []
    );

    return (
        <>
            <Loading visible={loading} />
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundImage: 'url("/imagem_fundo.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        borderRadius: 4,
                        maxWidth: 500,
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }}
                >
                    <Box
                        component="form"
                        onSubmit={handleSubmit(onSubmit)}
                        noValidate
                    >
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{ mb: 2, textAlign: 'center' }}
                        >
                            Registre-se
                        </Typography>

                        <TextField
                            {...register('nome', {
                                required: 'Por favor, digite seu nome',
                                pattern: {
                                    value: nomeRegex,
                                    message: 'Por favor, digite um nome válido e com mínimo 7 caracteres',
                                },
                            })}
                            label="Nome Completo"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.nome}
                            helperText={errors.nome?.message || ''}
                        />

                        <TextField
                            {...register('email', {
                                required: 'Por favor, digite seu email',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Email inválido',
                                },
                            })}
                            label="Email"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.email}
                            helperText={errors.email?.message || ''}
                            autoComplete="off"
                        />

                        <TextField
                            {...register('password', {
                                required: 'Por favor, digite sua senha',
                                pattern: {
                                    value: passwordRegex,
                                    message: 'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número, um caractere especial e ter no mínimo 7 caracteres.',
                                },
                            })}
                            label="Senha"
                            type="password"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.password}
                            helperText={errors.password?.message || ''}
                            autoComplete="off"
                        />

                        <TextField
                            {...register('confirmaSenha', {
                                required: 'Por favor, confirme sua senha',
                                validate: (value) =>
                                    value === watch('password') || 'As senhas não coincidem',
                            })}
                            label="Confirmação de Senha"
                            type="password"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.confirmaSenha}
                            helperText={errors.confirmaSenha?.message || ''}
                            autoComplete="off"
                        />

                        <TextField
                            {...register('cpf', {
                                required: 'Por favor, digite seu CPF',
                                maxLength: 11,
                                validate: (value) => value.length === 11 || 'CPF deve ter 11 dígitos',
                            })}
                            label="CPF"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.cpf}
                            helperText={errors.cpf?.message || ''}
                            inputProps={{
                                maxLength: 11,
                            }}
                            onKeyPress={handleKeyPress}
                        />

                        <TextField
                            {...register('telefone', {
                                required: 'Por favor, digite seu telefone',
                                maxLength: 11,
                                validate: (value) => value.length === 11 || 'Telefone deve ter 11 dígitos',
                            })}
                            label="Telefone"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.telefone}
                            helperText={errors.telefone?.message || ''}
                            inputProps={{
                                maxLength: 11,
                            }}
                            onKeyPress={handleKeyPress}
                        />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    color="primary"
                                >
                                    Registrar
                                </Button>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    color="error"
                                >
                                    Voltar
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>
        </>
    );
}
