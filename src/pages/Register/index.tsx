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

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

    const onSubmit = useCallback(async (data: IRegister) => {
        setLoading(true);
        try {
            const cleanCpf = data.cpf.replace(/\D/g, ''); // Remove tudo que não é número
            const cleanTelefone = data.telefone.replace(/\D/g, ''); // Remove tudo que não é número

            const cleanData = {
                ...data,
                cpf: cleanCpf,
                telefone: cleanTelefone,
                isAdmin: false
            };

            console.log('Dados enviados:', cleanData);

            await axios.post(`${import.meta.env.VITE_URL}/usuarios`, cleanData);

            handleShowSnackbar('Registro efetuado com sucesso!', 'success');
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            setLoading(false);
            console.error('Erro ao registrar:', error);
            handleShowSnackbar('Erro ao registrar usuário!', 'error');
        }
    }, [navigate]);

    // Função para bloquear a digitação de letras e caracteres especiais
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    };

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
                            autoComplete="off"
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

                        {/* CPF */}
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
                            onKeyPress={handleKeyPress} // Bloquear letras e caracteres
                        />

                        {/* Telefone */}
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
                            onKeyPress={handleKeyPress} // Bloquear letras e caracteres
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
