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
import DropZone from "../../../components/Dropzone";
import { Loading } from "../../../components/Loading";
import { IToken } from "../../../interfaces/token";

interface IPremios {
    id: number;
    nome: string;
    categoria: string;
    data_recebimento: string;
    imagem: File | null;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginBottom: '1rem',
});


export default function GerenciarPremios() {
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<IPremios>({
        defaultValues: {
            id: 0,
            nome: '',
            categoria: '',
            data_recebimento: '',
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

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken


    useEffect(() => {
        setPreviewUrl(""); 
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
            return;
        }

        const premioId = Number(id);
        if (!isNaN(premioId)) {
            setLoading(true);
            axios.get(import.meta.env.VITE_URL + `/premios/${premioId}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
                .then((res) => {
                    const premioData = res.data;
                    setIsEdit(true);
                    setValue("id", premioData.id || 0);
                    setValue("nome", premioData.nome || '');
                    setValue("categoria", premioData.categoria || '');
                    setValue("data_recebimento", premioData.data_recebimento || '');
                    if (premioData.imagem) {
                        setPreviewUrl(import.meta.env.VITE_URL + `/imagem/premios/${premioData.imagem}`);
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

    const submitForm: SubmitHandler<IPremios> = useCallback((data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('id', data.id?.toString() || '');
        formData.append('nome', data.nome);
        formData.append('categoria', data.categoria);
        formData.append('data_recebimento', data.data_recebimento);
        formData.append('imagem', data.imagem || '');

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                authorization: `Bearer ${token.access_token}`,
            }
        };

        const url = isEdit
            ? `${import.meta.env.VITE_URL}/premios/${id}`
            : `${import.meta.env.VITE_URL}/premios/`;

        const request = isEdit
            ? axios.post(url, formData, config)
            : axios.post(url, formData, config);

        request
            .then((response) => {
                handleShowSnackbar(
                    isEdit
                        ? 'Prêmio editado com sucesso!'
                        : 'Prêmio adicionado com sucesso!',
                    'success'
                );
                setLoading(false);
                setTimeout(() => { navigate('/premios'); }, 1500);
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
                            {isEdit ? "Editar Prêmio" : "Adicionar Prêmio"}
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
                                        label="Nome do Prêmio"
                                        error={!!errors.nome}
                                        helperText={errors.nome?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="categoria"
                                control={control}
                                rules={{ required: 'Categoria é obrigatória!' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.categoria} sx={{ mb: 2 }}>
                                        <InputLabel>Categoria</InputLabel>
                                        <Select {...field} label="Categoria">
                                            <MenuItem value="">Selecione a categoria</MenuItem>
                                            <MenuItem value="academico">Acadêmico</MenuItem>
                                            <MenuItem value="profissional">Profissional</MenuItem>
                                            <MenuItem value="honraria">Honraria</MenuItem>
                                        </Select>
                                        {errors.categoria && (
                                            <FormHelperText>{errors.categoria.message}</FormHelperText>
                                        )}
                                    </FormControl>
                                )}
                            />

                            <Controller
                                name="data_recebimento"
                                control={control}
                                rules={{ required: 'Data de recebimento é obrigatória!' }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        aria-label="Data de Recebimento"
                                        fullWidth
                                        label="Data de Recebimento"
                                        type="date"
                                        error={!!errors.data_recebimento}
                                        helperText={errors.data_recebimento?.message}
                                        InputLabelProps={{ shrink: true }}
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
                        </Box>
                    </StyledPaper>
                </Container>
            </LayoutDashboard>
        </>
    );
}
