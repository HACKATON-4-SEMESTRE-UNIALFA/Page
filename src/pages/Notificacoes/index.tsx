import { useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import { verificaTokenExpirado } from "../../services/token"
import { Loading } from "../../components/Loading"
import axios from "axios"
import {
    Container,
    Typography,
    Box,
    Chip,
    Button,
} from '@mui/material'
import {
    DataGrid,
    GridColDef,
    GridValueGetter,
    GridRenderCellParams,
    GridAlignment
} from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import { LayoutDashboard } from "../../components/LayoutDashboard"
import { SnackbarMui } from "../../components/Snackbar"
import { IToken } from "../../interfaces/token"

interface INotificacoes {
    id: number
    id_usuario: string
    id_reserva: string
    mensagem: string
    tipo: string
    created_at: string
    visualizacao: boolean
}

interface IUsuario {
    id: number
    nome: string
}

export default function Notificacoes() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dadosNotificacoes, setNotificacoes] = useState<Array<INotificacoes>>([])
    const [usuarios, setUsuarios] = useState<Map<number, string>>(new Map())

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

        // Busca Notificações
        if (token.usuario.isAdmin) {
            // Busca Usuarios
            axios.get(import.meta.env.VITE_URL + '/usuarios', { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    const usuarioMap = new Map<number, string>()
                    res.data.forEach((usuario: IUsuario) => {
                        usuarioMap.set(usuario.id, usuario.nome)
                    })
                    setUsuarios(usuarioMap)
                })
                .catch((err) => {
                    console.log(err)
                    handleShowSnackbar("Erro ao buscar Usuários", "error")
                })

            axios.get(import.meta.env.VITE_URL + '/reserva/notificacao', { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    setNotificacoes(res.data)
                    setLoading(false)
                })
                .catch((err) => {
                    setNotificacoes(err)
                    setLoading(false)
                })
        } else {
            axios.get(import.meta.env.VITE_URL + '/notificacoes?id_usuario=' + token.usuario.id, { headers: { Authorization: `Bearer ${token.accessToken}` } })
                .then((res) => {
                    setNotificacoes(res.data)
                    setLoading(false)
                })
                .catch((err) => {
                    setNotificacoes(err)
                    setLoading(false)
                })
        }
    }, [])

    const handleShowSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
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
            field: 'reserva',
            headerName: 'Reserva',
            width: 230,
            filterable: true,
        },
        {
            field: 'tipo',
            headerName: 'Tipo',
            width: 115,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Chip
                        label={params.value}
                        color={
                            params.value === 'confirmacao' ? 'success' :
                                params.value === 'cancelamento' ? 'error' :
                                    params.value === 'lembrete' ? 'info' :
                                        'info'
                        }
                    />
                </Box>
            ),
        },
        {
            field: 'mensagem',
            headerName: 'Mensagem',
            minWidth: 270,
            flex: 1,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box
                    sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        padding: '12px',
                        width: '100%',
                        textAlign: 'left',
                        '& p': {
                            margin: 0,
                            lineHeight: 1.5
                        }
                    }}
                >
                    <Typography variant="body2">
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'visualizacao',
            headerName: 'Visto',
            width: 80,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Chip
                        label={params.value ? "Sim" : "Não"}
                        color={params.value ? 'success' : 'error'}
                    />
                </Box>
            ),
        },
        {
            field: 'created_at',
            headerName: 'Data',
            minWidth: 120,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box
                    sx={{
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        padding: '12px',
                        width: '100%',
                        textAlign: 'left',
                        '& p': {
                            margin: 0,
                            lineHeight: 1.5
                        }
                    }}
                >
                    <Typography variant="body2">
                        {new Date(String(params.value)).toLocaleString("pt-BR")}
                    </Typography>
                </Box>
            ),
        }
    ]

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
                <Container maxWidth="xl" sx={{ mb: 4, mt: 3 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Notificações
                        </Typography>

                        <Button
                            onClick={() => navigate('/notificacoes/enviar')}
                            variant="contained"
                            color="primary"
                            sx={{ ml: 2 }}
                        > Marcar todos como lidos</Button>

                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={dadosNotificacoes}
                            columns={columns}
                            getRowHeight={() => 90} // Increased row height
                            density="comfortable"
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[10, 25, 50, { value: -1, label: 'Todos os Registros' }]}
                            disableColumnResize
                            disableRowSelectionOnClick
                            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                            sx={{
                                height: 650, // Increased grid height
                                boxShadow: 2,
                                border: 2,
                                borderColor: 'primary.light',
                                '& .MuiDataGrid-cell': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    overflow: 'visible',
                                    textOverflow: 'clip',
                                    padding: '8px',
                                },
                                '& .MuiDataGrid-cell:hover': {
                                    color: 'primary.main',
                                },
                                '& .MuiDataGrid-row': {
                                    borderBottom: '1px solid #e0e0e0',
                                    minHeight: '90px !important', // Force minimum height
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
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