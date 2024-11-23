import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { verificaTokenExpirado } from "../../services/token";
import { Loading } from "../../components/Loading";
import axios from "axios";
import {
    Container,
    Typography,
    Button,
    Box,
    IconButton,
    Chip
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { ConfirmationDialog } from "../../components/Dialog";
import { SnackbarMui } from "../../components/Snackbar";
import { IToken } from "../../interfaces/token";


interface IUsers {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    isAdmin: boolean;
}

export default function Usuarios() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [dadosUsers, setdadosUsers] = useState<Array<IUsers>>([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [dialogState, setDialogState] = useState({
        open: false,
        id: null as number | null
    });

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken;

    useEffect(() => {
        if (localStorage.length == 0 || verificaTokenExpirado()) {
            navigate("/");
        }

        setLoading(true);

        axios.get(import.meta.env.VITE_API_URL + '/usuarios', { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then((res) => {
                console.log(res.data);
                setdadosUsers(res.data.usuario);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                handleShowSnackbar(err.response.data, 'error');
                setdadosUsers(err);
            });
    }, []);

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
            align: 'center',
        },
        {
            field: 'nome',
            headerName: 'Nome',
            width: 250,
            filterable: true,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params: GridRenderCellParams) => (
                <Typography noWrap sx={{ textOverflow: 'ellipsis', width: '100%' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'email',
            headerName: 'E-mail',
            width: 250,
            filterable: true,
            headerAlign: 'left',
            align: 'left',
            renderCell: (params: GridRenderCellParams) => (
                <Typography noWrap sx={{ textOverflow: 'ellipsis', width: '100%' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'telefone',
            headerName: 'Telefone',
            width: 150,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Typography noWrap sx={{ textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'cpf',
            headerName: 'CPF',
            width: 180,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Typography noWrap sx={{ textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                    {params.value}
                </Typography>
            ),
        },
        {
            field: 'isAdmin',
            headerName: 'Administrador',
            width: 120,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Chip label={params.value ? 'Sim' : 'Não'} />
                </Box>
            ),
        },
        {
            field: 'acoes',
            headerName: 'Ações',
            flex: 2,
            minWidth: 150,
            filterable: false,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <IconButton
                        color="primary"
                        onClick={() => navigate(`/usuarios/${params.row.id}`)}
                        size="large"
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        size="large"
                        onClick={() => removeUser(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];


    const removeUser = useCallback((id: number) => {
        setDialogState({
            open: true,
            id: id
        });
    }, []);

    const handleConfirmedDelete = useCallback(() => {
        const id = dialogState.id;

        axios.delete(import.meta.env.VITE_API_URL + `/usuarios/${id}`, { headers: { Authorization: `Bearer ${token.accessToken}` } })
            .then(() => {
                handleShowSnackbar("Usuário removido com sucesso", "success");
                setdadosUsers((prevRows) => prevRows.filter((row) => row.id !== id));
                setLoading(false);
            })
            .catch((error) => {
                const errorMessage = error.response?.data || "Erro ao remover usuário";
                setLoading(false);
                handleShowSnackbar(errorMessage, "error");
            });
    }, [dialogState.id, setLoading]);

    return (
        <>
            <Loading visible={loading} />
            <SnackbarMui
                open={snackbarVisible}
                message={message}
                severity={severity}
                onClose={() => setSnackbarVisible(false)}
                position={{
                    vertical: "top",
                    horizontal: "center",
                }}
            />
            <LayoutDashboard>
                <Container maxWidth="xl" sx={{ mb: 4, mt: 3 }}>
                    <ConfirmationDialog
                        open={dialogState.open}
                        title="Confirmar exclusão"
                        message="Tem certeza que deseja excluir este usuário?"
                        onConfirm={handleConfirmedDelete}
                        onClose={() => setDialogState({ open: false, id: null })}
                    />
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Usuários
                        </Typography>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/usuarios/novo')}
                        >
                            Novo Usuário
                        </Button>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={dadosUsers}
                            columns={columns}
                            rowHeight={60}
                            density="standard"
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[10, 25, 50, { value: -1, label: 'Todos os Registros' }]}
                            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                            disableColumnResize
                            disableRowSelectionOnClick
                            sx={{
                                height: 400,
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
    );
}
