import { Loading } from "../../components/Loading";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { verificaTokenExpirado } from "../../services/token";
import axios from "axios";
import { Box, Button, Container, FormControl, InputLabel, Paper, styled, TextField, Typography } from "@mui/material";
import { SnackbarMui } from "../../components/Snackbar";
import { CustomTextarea } from "../../components/CustomTextArea";
import DropZone from "../../components/Dropzone";
import { IToken } from "../../interfaces/token";

interface IHistoria {
    id: number
    ano_fundacao: string
    mvv: string
    pmh: string
    texto_institucional: string
    foto_capa: File | null
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
    marginTop: '1rem',
});
export default function Historia() {
    const [range, setRange] = useState();
    const [lastChange, setLastChange] = useState();
    const [readOnly, setReadOnly] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<IHistoria>({
        defaultValues: {
            id: 0,
            ano_fundacao: '',
            mvv: '',
            pmh: '',
            texto_institucional: '',
            foto_capa: null
        }
    });
    const { id } = useParams();

    const token = JSON.parse(localStorage.getItem('casadapaz.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        const HistoriaId = Number(id);
        if (!isNaN(HistoriaId)) {
            setLoading(true);
            axios.get(import.meta.env.VITE_URL + `/historias/${HistoriaId}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
                .then((res) => {
                    const historiaData = res.data;
                    setValue("ano_fundacao", historiaData.ano_fundacao.split('T')[0] || '');
                    setValue("mvv", historiaData.mvv || '');
                    setValue("pmh", historiaData.pmh || '');
                    setValue("texto_institucional", historiaData.texto_institucional || '');
                    if (historiaData.foto_capa) {
                        setValue("foto_capa", historiaData.foto_capa);
                        setPreviewUrl(import.meta.env.VITE_URL + `/imagem/fotoscapas/${historiaData.foto_capa}`);
                    }
                    setLoading(false)
                })
                .catch((err) => {
                    handleShowSnackbar(err.response.data.message, 'error');
                    setLoading(false)
                })
        }
    }, [id, navigate, setValue])

    const handleShowSnackbar = (msg: string, sev: 'success' | 'error' | 'info' | 'warning') => {
        setMessage(msg);
        setSeverity(sev);
        setSnackbarVisible(true);
    };

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

    const submitForm: SubmitHandler<IHistoria> = useCallback((data) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('ano_fundacao', data.ano_fundacao);
        formData.append('mvv', data.mvv);
        formData.append('pmh', data.pmh);
        formData.append('texto_institucional', data.texto_institucional);
        formData.append('foto_capa', data.foto_capa || '');

        axios.post(import.meta.env.VITE_URL + `/historias/${id}`, formData, {
            headers: {
                "Authorization": 'Bearer ' + token.access_token
            }
        })
            .then((res) => {
                setLoading(false);
                handleShowSnackbar('Historia atualizada com sucesso!', 'success');
            })
            .catch((err) => {
                setLoading(false);
                handleShowSnackbar('Erro ao atualizar historia', 'error');
            })
    }, [id, handleShowSnackbar, setValue])

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
                            História
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>

                            <InputLabel sx={{ mt: 0, mb: 1, color: 'black' }}>Imagem Capa</InputLabel>
                            <Controller
                                name="foto_capa"
                                control={control}
                                rules={{ required: 'Imagem é obrigatória!' }}
                                render={({ field: { value, onChange } }) => (
                                    <DropZone
                                        previewUrl={previewUrl}
                                        onFileChange={(file) => {
                                            setValue("foto_capa", file); 
                                            onChange(file); 
                                            handleFileChange(file);
                                        }}
                                        onDeleteImage={() => {
                                            setValue("foto_capa", null);
                                            setPreviewUrl("");
                                        }}
                                        error={!!errors.foto_capa}
                                    />
                                )}
                            />

                            <Controller
                                name="ano_fundacao"
                                control={control}
                                rules={{ required: 'Data de Fundação é obrigatória!' }}
                                render={({ field }) => (
                                    <FormTextField
                                        {...field}
                                        aria-label="Data de Fundação"
                                        fullWidth
                                        label="Data de Fundação"
                                        type="date"
                                        error={!!errors.ano_fundacao}
                                        helperText={errors.ano_fundacao?.message}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                )}
                            />

                            <Controller
                                name="mvv"
                                control={control}
                                rules={{
                                    required: 'Missão, Visão e Valores são obrigatórios'
                                }}
                                render={({ field }) => (
                                    <CustomTextarea
                                        {...field}
                                        minRows={10}
                                        placeholder={"Exemplo:\nNosso valores são . . .\nNossa missão é . . .\nTemos . . . valores"}
                                        aria-label="Missão, Visão e Valores"
                                        label="Missão, Visão e Valores"
                                        error={!!errors.mvv}
                                        helperText={errors.mvv?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="pmh"
                                control={control}
                                rules={{
                                    required: 'Principais Marcos Históricos são obrigatórios'
                                }}
                                render={({ field }) => (
                                    <CustomTextarea
                                        {...field}
                                        minRows={10}
                                        placeholder={"Exemplo:\nem 2020: fizemos . . .\nem 2021: tivemos X conquistas . . .\nem 2024: temos uma melhora na qualidade. . ."}
                                        aria-label="Principais Marcos Históricos"
                                        label="Principais Marcos Históricos"
                                        error={!!errors.pmh}
                                        helperText={errors.pmh?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="texto_institucional"
                                control={control}
                                rules={{
                                    required: 'Texto institucional é obrigatório'
                                }}
                                render={({ field }) => (
                                    <CustomTextarea
                                        {...field}
                                        minRows={10}
                                        placeholder={"Exemplo:\nA nossa instituição busca oferecer uma educação de qualidade para as crianças e adolescentes.\nNosso objetivo é formar cidadãos críticos, éticos e responsáveis, capazes de contribuir para o desenvolvimento da sociedade.\nPara isso, contamos com uma equipe de profissionais qualificados e comprometidos, que buscam inovar e melhorar constantemente o nosso trabalho.\n"}
                                        aria-label="Texto institucional"
                                        label="Texto institucional"
                                        error={!!errors.texto_institucional}
                                        helperText={errors.texto_institucional?.message}
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
    )
}