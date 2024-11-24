import { useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { verificaTokenExpirado } from "../../services/token"
import { Loading } from "../../components/Loading"
import axios from "axios"
import {
    Container,
    Typography,
    Button,
    Box,
    IconButton,
    Avatar,
    Tooltip
} from '@mui/material'
import {
    DataGrid,
    GridColDef,
    GridValueGetter,
    GridRenderCellParams,
    GridAlignment
} from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import HistoryIcon from '@mui/icons-material/History';
import { LayoutDashboard } from "../../components/LayoutDashboard"
import { ConfirmationDialog } from "../../components/Dialog"
import { SnackbarMui } from "../../components/Snackbar"
import { IToken } from "../../interfaces/token"
import { GridInitialStateCommunity } from "@mui/x-data-grid/models/gridStateCommunity"
import ModalHist from "../../components/ModalHist"
import ModalCanReserva from "../../components/ModalCanReserva"

interface IReserva {
    id: number
    id_ambiente: number
    horario: string
    data: string
    usuario_id: number
    status: string
}

interface IAmbiente {
    id: number
    nome: string
}

interface IUsuario {
    id: number
    nome: string
}

export default function Reservas() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosReservas, setDadosReservas] = useState<Array<IReserva>>([])
    const [ambientes, setAmbientes] = useState<Map<number, string>>(new Map())
    const [usuarios, setUsuarios] = useState<Map<number, string>>(new Map())

    const [historico, setHistorico] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [idReservaSelecionada, setIdReservaSelecionada] = useState<number | null>(null);



    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    })


    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken

    useEffect(() => {
        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/")
        }

        setLoading(true)

        // Busca ambientes
        axios.get(import.meta.env.VITE_URL + '/ambientes', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                const ambienteMap = new Map<number, string>()
                res.data.ambiente.forEach((ambiente: IAmbiente) => {
                    ambienteMap.set(ambiente.id, ambiente.nome)
                })
                setAmbientes(ambienteMap)
            })
            .catch(() => handleShowSnackbar("Erro ao buscar ambientes", "error"))

        // Busca reservas
        if (token.usuario.isAdmin) {
            // Busca Usuarios
            axios.get(import.meta.env.VITE_URL + '/usuarios', { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    const usuarioMap = new Map<number, string>()
                    res.data.usuario.forEach((usuario: IUsuario) => {
                        usuarioMap.set(usuario.id, usuario.nome)
                    })
                    setUsuarios(usuarioMap)
                })
                .catch((err) => {
                    console.error(err)
                    handleShowSnackbar("Erro ao buscar Usuários", "error")
                })

            axios.get(import.meta.env.VITE_URL + '/reservas', { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    setDadosReservas(res.data.reserva)
                    setLoading(false)
                })
                .catch((err) => {
                    setDadosReservas(err)
                    setLoading(false)
                })
        } else {
            axios.get(import.meta.env.VITE_URL + '/reservas?id_usuario=' + token.usuario.id, { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    setDadosReservas(res.data)
                    setLoading(false)
                })
                .catch((err) => {
                    setDadosReservas(err)
                    setLoading(false)
                })
        }
    }, [])

    const abrirModal = useCallback((id: number) => {
        setIdReservaSelecionada(id);
        setModalAberto(true);
    }, []);

    const fecharModal = useCallback(() => {
        setModalAberto(false);
        setIdReservaSelecionada(null);
    }, []);

    const handleOpen = useCallback(() => setOpenModal(true), []);
    const handleClose = useCallback(() => setOpenModal(false), []);

    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, [setSnackbarVisible, setMessage, setSeverity]);

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 60,
            filterable: false,
            sortable: false,
            headerAlign: 'center',
            align: 'center'
        },
        ...(token.usuario.isAdmin
            ? [
                {
                    field: 'id_usuario',
                    headerName: 'Criado por',
                    width: 150,
                    filterable: true,
                    headerAlign: 'center' as GridAlignment,
                    align: 'center' as GridAlignment,
                    valueGetter: (params: number) => usuarios.get(params) || "Desconhecido",
                },
            ]
            : []),
        {
            field: 'id_ambiente',
            headerName: 'Ambiente',
            width: 200,
            filterable: true,
            valueGetter: (params) => ambientes.get(params) || "Desconhecido",
        },
        {
            field: 'horario',
            headerName: 'Horário',
            width: 150,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'data',
            headerName: 'Data',
            width: 150,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            valueGetter: (params: GridValueGetter) => {
                return new Date(params + 'T00:00:00').toLocaleDateString("pt-BR")
            },
        },
        {
            field: 'status',
            headerName: 'Situação',
            width: 150,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'acoes',
            headerName: 'Ações',
            flex: 1,
            minWidth: 150,
            filterable: false,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => {
                if (params.row.status !== 'ativo') {
                    return (
                        <Box >
                            <Tooltip title="Histórico" placement="top" arrow>
                                <IconButton
                                    color="info"
                                    size="large"
                                    onClick={() => fetchHistorico(params.row.id)}
                                >
                                    <HistoryIcon />
                                </IconButton>
                            </Tooltip>
                        </Box >
                    );
                }

                return (
                    <Box >
                        <Tooltip title="Editar" placement="top" arrow>
                            <IconButton
                                color="primary"
                                onClick={() => navigate(`/reservas/${params.row.id}`)}
                                size="large"
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar" placement="top" arrow>
                            <IconButton
                                color="error"
                                size="large"
                                onClick={() => abrirModal(params.row.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Histórico" placement="top" arrow>
                            <IconButton
                                color="info"
                                size="large"
                                onClick={() => fetchHistorico(params.row.id)}
                            >
                                <HistoryIcon />
                            </IconButton>
                        </Tooltip>
                    </Box >
                );
            },
        },
    ]


    const fetchHistorico = useCallback(async (idReserva: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_URL}/historico?id_reserva=${idReserva}`);
            setHistorico(response.data);
            handleOpen();
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }, []);

    const salvarCancelamento = useCallback(async (mensagem: string) => {
        if (!idReservaSelecionada) return;

        try {
            await axios.post(`/reservas/desativa/${idReservaSelecionada}/usuario/${token.usuario.id}`, {
                mensagem
            }, { headers: { Authorization: `Bearer ${token.accessToken}` } });
            fecharModal(); // Fecha o modal após o sucesso
            handleShowSnackbar("Reserva Cancelada realizado com sucesso!", "success");
        } catch (error) {
            fecharModal();
            console.error("Erro ao salvar o cancelamento:", error);
            handleShowSnackbar("Ocorreu um erro ao cancelar a reserva", "error");
        }
    }, [idReservaSelecionada, handleShowSnackbar, fecharModal]);

    return (
        <>
            <Loading visible={loading} />
            <ModalHist
                historico={historico}
                open={openModal}
                handleClose={handleClose}
            />
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
                <Container maxWidth="xl" sx={{ mb: 4, mt: 3 }}>
                    {idReservaSelecionada &&
                        <ModalCanReserva
                            open={modalAberto}
                            handleClose={fecharModal}
                            onSave={salvarCancelamento}
                        />
                    }
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            {token.usuario.isAdmin ? "Todas as Reservas" : "Minhas Reservas"}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/reservas/add')}
                        >
                            Adicionar
                        </Button>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={dadosReservas}
                            columns={columns}
                            rowHeight={50}
                            density="standard"
                            initialState={{
                                sorting: {
                                    sortModel: [{ field: 'data', sort: 'asc' }], // Ordenação inicial
                                },
                            } as GridInitialStateCommunity}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[10, 25, 50, { value: -1, label: 'Todos os Registros' }]}
                            disableColumnResize
                            disableRowSelectionOnClick
                            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                            sx={{
                                height: 450,
                                boxShadow: 2,
                                border: 2,
                                borderColor: 'primary.light',
                                '& .MuiDataGrid-cell': {
                                    overflow: 'visible',
                                    textOverflow: 'clip',
                                },
                                '& .MuiDataGrid-cell:hover': {
                                    color: 'primary.main',
                                },
                                '& .MuiDataGrid-row': {
                                    borderBottom: '1px solid #e0e0e0',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: '2px solid #e0e0e0',
                                },
                                '& .MuiDataGrid-footerContainer': {
                                    borderTop: '2px solid #e0e0e0',
                                    backgroundColor: '#f5f5f5',
                                },
                                '& .MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel': {
                                    margin: 0,
                                },
                                '& .MuiTablePagination-root': {
                                    overflow: 'hidden',
                                }
                            }}
                        />
                    </Box>
                </Container>
            </LayoutDashboard>
        </>
    )
}
