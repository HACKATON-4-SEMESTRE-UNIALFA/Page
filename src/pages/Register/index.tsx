import { useCallback, useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Grid,
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

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const onSubmit = useCallback(async (data: IRegister) => {
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_URL}/register`, data);
            handleShowSnackbar('Registro efetuado com sucesso!', 'success');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            setLoading(false);
            console.error('Erro ao registrar:', error);
            handleShowSnackbar('Erro ao registrar usuário!', 'error');
        }
    }, [navigate]);

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
                            Registro
                        </Typography>

                        <TextField
                            {...register('nome', { required: 'Por favor, digite seu nome' })}
                            label="Nome"
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
                            autoComplete="off" // Adicionei autoComplete="off" para evitar o preenchimento automático
                        />

                        <TextField
                            {...register('password', { required: 'Por favor, digite sua senha' })}
                            label="Senha"
                            type="password"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.password}
                            helperText={errors.password?.message || ''}
                            autoComplete="off" // Adicionei autoComplete="off" para evitar o preenchimento automático
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
                            autoComplete="off" // Adicionei autoComplete="off" para evitar o preenchimento automático
                        />

                        <TextField
                            {...register('cpf', {
                                required: 'Por favor, digite seu CPF',
                                pattern: {
                                    value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                                    message: 'CPF inválido (formato: XXX.XXX.XXX-XX)',
                                },
                            })}
                            label="CPF"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.cpf}
                            helperText={errors.cpf?.message || ''}
                        />

                        <TextField
                            {...register('telefone', {
                                required: 'Por favor, digite seu telefone',
                                pattern: {
                                    value: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                                    message: 'Telefone inválido (formato: (XX) XXXXX-XXXX)',
                                },
                            })}
                            label="Telefone"
                            size="small"
                            fullWidth
                            sx={{ mb: 2 }}
                            error={!!errors.telefone}
                            helperText={errors.telefone?.message || ''}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
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
                            <Grid item xs={12} sm={6}>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    color="error" // Aqui a cor foi ajustada para vermelho
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
