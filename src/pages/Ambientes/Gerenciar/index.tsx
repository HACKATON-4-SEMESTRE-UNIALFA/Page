import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verificaTokenExpirado } from "../../../services/token";
import { Controller, set, SubmitHandler, useForm } from "react-hook-form";
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
import DropZone from "../../../components/Dropzone";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";
import { Stack } from "immutable";

interface IAmbientes {
    id: 0,
    nome: string,
    capacidade: number | null,
    status: string,
    equipamentos_disponiveis: string,
    descricao: string,
    imagem: File | null
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});


export default function GerenciarAmbientes() {
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<IAmbientes>({
        defaultValues: {
            id: 0,
            nome: '',
            capacidade: null,
            status: '',
            equipamentos_disponiveis: '',
            descricao: '',
            imagem: null
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

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken


    useEffect(() => {
        setPreviewUrl("");
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        const ambienteId = Number(id);
        if (!isNaN(ambienteId)) {
            setLoading(true);
            axios.get(import.meta.env.VITE_URL + `/ambientes/${ambienteId}`, { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    const ambienteData = res.data;
                    setIsEdit(true);
                    setValue("id", ambienteData.id || 0);
                    setValue("nome", ambienteData.nome || '');
                    setValue("capacidade", ambienteData.capacidade || 0);
                    setValue("status", ambienteData.status || '');
                    setValue("equipamentos_disponiveis", ambienteData.equipamentos_disponiveis || '');
                    setValue("descricao", ambienteData.descricao || '');
                    if (ambienteData.imagem) {
                        setPreviewUrl(import.meta.env.VITE_URL + `/imagem/ambientes/${ambienteData.imagem}`);
                    }
                    setLoading(false)
                })
                .catch((err) => {
                    handleShowSnackbar(err.response.data.message, 'error');
                    setLoading(false)
                })
        }
    }, [id, navigate, setValue]);


    const handleFileChange = useCallback((file: File | null) => {
        if (file) {
            if (file instanceof File) {
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    setPreviewUrl(fileReader.result as string);
                };
                fileReader.readAsDataURL(file);
            } else if (typeof file === "string") {
                setPreviewUrl(file);
            }
        }
    }, [handleShowSnackbar, setValue]);

    const submitForm: SubmitHandler<IAmbientes> = useCallback((data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('id', data.id?.toString() || '');
        formData.append('nome', data.nome);
        formData.append('capacidade', data.capacidade?.toString() || '');
        formData.append('status', data.status);
        formData.append('equipamentos_disponiveis', data.equipamentos_disponiveis);
        formData.append('descricao', data.descricao);
        if (data.imagem) {
            formData.append('imagem', data.imagem);
        }

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                authorization: `Bearer ${token.accessToken}`,
            }
        };

        const url = isEdit
            ? `${import.meta.env.VITE_URL}/ambientes/${id}`
            : `${import.meta.env.VITE_URL}/ambientes/`;

        const request = isEdit
            ? axios.post(url, formData, config)
            : axios.post(url, formData, config);

        request
            .then((response) => {
                handleShowSnackbar(
                    isEdit
                        ? 'Ambiente editado com sucesso!'
                        : 'Ambiente adicionado com sucesso!',
                    'success'
                );
                setLoading(false);
                navigate('/horarios/' + response.data.ambiente.id, {
                    state: {
                        setAmbiente: response.data
                    }
                });
            })
            .catch((error) => {
                const errorMessage = error.response?.data || 'Erro ao processar a requisição';
                setLoading(false);
                handleShowSnackbar(errorMessage, 'error');
            });
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
                            {isEdit ? "Editar Ambiente" : "Adicionar Ambiente"}
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
                            <Controller
                                name="nome"
                                control={control}
                                rules={{
                                    required: 'Nome é obrigatório!'
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        fullWidth
                                        label="Nome do Ambiente"
                                        error={!!errors.nome}
                                        helperText={errors.nome?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="capacidade"
                                control={control}
                                rules={{
                                    required: 'Capacidade é obrigatória!'
                                }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        type="number"
                                        fullWidth
                                        label="Quantidade de Lugares"
                                        error={!!errors.capacidade}
                                        helperText={errors.capacidade?.message}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />

                            <Controller
                                name="status"
                                control={control}
                                rules={{ required: 'Status é obrigatória!' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.status} sx={{ mb: 2 }}>
                                        <InputLabel>Categoria</InputLabel>
                                        <Select {...field} label="Categoria">
                                            <MenuItem value="">Selecione a categoria</MenuItem>
                                            <MenuItem value="Disponível">Disponível</MenuItem>
                                            <MenuItem value="Manutenção">Manutenção</MenuItem>
                                            <MenuItem value="Indisponível">Indisponível</MenuItem>
                                        </Select>
                                        {errors.status && (
                                            <FormHelperText>{errors.status.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="equipamentos_disponiveis"
                                control={control}
                                rules={{ required: 'Equipamentos Disponíveis é obrigatório!' }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        aria-label="Equipamentos Disponíveis"
                                        fullWidth
                                        multiline
                                        rows={5}
                                        label="Descreva os equipamentos disponíveis"
                                        type="textearea"
                                        error={!!errors.equipamentos_disponiveis}
                                        helperText={errors.equipamentos_disponiveis?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="imagem"
                                control={control}
                                rules={{ required: 'Imagem é obrigatória!' }}
                                render={({ field: { onChange } }) => (
                                    <DropZone
                                        previewUrl={previewUrl}
                                        onFileChange={(file) => {
                                            setValue("imagem", file);
                                            onChange(file);
                                            handleFileChange(file);
                                        }}
                                        onDeleteImage={() => {
                                            setValue("imagem", null);
                                            setPreviewUrl("");
                                        }}
                                        error={!!errors.imagem}
                                    />
                                )}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                sx={{ mt: 2 }}
                            >
                                Salvar
                            </Button>

                            {isEdit && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    size="large"
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate("/horarios/" + id)}
                                >
                                    Editar Horários de Funcionamento
                                </Button>
                            )}
                        </Box>
                    </StyledPaper>
                </Container>
            </LayoutDashboard>
        </>
    );
}
