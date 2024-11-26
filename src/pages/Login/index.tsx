import { useCallback, useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { SnackbarMui } from '../../components/Snackbar';
import { Loading } from '../../components/Loading';
import './login.styles.css';

type ILogin = {
    email: string;
    password: string;
};

export default function Login() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ILogin>();

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [loading, setLoading] = useState(false);

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const onSubmit = useCallback(async (data: ILogin) => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_URL}/login`, {
                email: data.email,
                password: data.password,
            });
            localStorage.setItem(
                'auth.token',
                JSON.stringify({
                    accessToken: response.data.accessToken,
                    usuario: response.data.usuario,
                })
            );
            handleShowSnackbar('Login efetuado com sucesso!', 'success');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error) {
            setLoading(false);
            handleShowSnackbar('Login ou senha inválidos!', 'error');
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
                        maxWidth: 400,
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
                            Login
                        </Typography>

                        <div>
                            <TextField
                                {...register('email', {
                                    required: 'Por favor digite seu email',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Email inválido',
                                    },
                                })}
                                id="email"
                                label="Email"
                                type="email"
                                size="small"
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                                error={!!errors.email}
                                helperText={errors.email?.message || ''}
                                variant="outlined"
                            />
                        </div>

                        <div>
                            <TextField
                                {...register('password', {
                                    required: 'Por favor digite sua senha',
                                })}
                                id="password"
                                label="Senha"
                                type="password"
                                size="small"
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                                error={!!errors.password}
                                helperText={errors.password?.message || ''}
                                variant="outlined"
                            />
                        </div>

                        <Button
                            id="botao"
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            color="primary"
                        >
                            Entrar
                        </Button>

                        <Typography
                            variant="body2"
                            sx={{
                                mt: 2,
                                textAlign: 'center',
                                color: 'primary.main',
                            }}
                        >
                            Não tem uma conta?{' '}
                            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
                                Registre-se
                            </Link>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </>
    );
}
