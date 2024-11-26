import { useCallback, useEffect, useState } from "react";
import {
    Container,
    Typography,
    Box,
    Chip,
    TextField,
    Button,
    IconButton,
} from '@mui/material';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams
} from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { Loading } from "../../components/Loading";
import { SnackbarMui } from "../../components/Snackbar";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import { IToken } from "../../interfaces/token";
import { verificaTokenExpirado } from "../../services/token";
import { useNavigate } from "react-router-dom";

interface IWhiteList {
    id: number;
    data: string;
}

export default function WhiteList() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const [loading, setLoading] = useState(false);
    const [whiteListData, setWhiteListData] = useState<IWhiteList[]>([]);
    const navigate = useNavigate();

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const token = JSON.parse(localStorage.getItem('auth.token') || '') as IToken


    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, []);

    const fetchWhiteListData = useCallback(() => {
        setLoading(true);
        axios.get(import.meta.env.VITE_URL + '/whitelist', {
            headers: { Authorization: `Bearer ${token.accessToken}` }
        })
            .then((res) => {
                // Ensure data is an array and has the correct type
                const data = Array.isArray(res.data.whiteList)
                    ? res.data.whiteList.map((item: { id: any; data: any; }) => ({
                        id: item.id || 0,
                        data: item.data || ''
                    }))
                    : [];
                setWhiteListData(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                (err);
                handleShowSnackbar(
                    err.response?.data || "Erro ao carregar dados",
                    'error'
                );
            });
    }, [token.accessToken, handleShowSnackbar]);

    useEffect(() => {
        if (localStorage.length === 0 || verificaTokenExpirado()) {
            navigate("/");
        }
        fetchWhiteListData();
    }, [fetchWhiteListData]);

    const handleEditDate = useCallback((id: number, date: string) => {
        setSelectedId(id);
        setSelectedDate(date);
    }, []);

    const handleSaveDate = useCallback(() => {
        // Validate date
        if (!selectedDate) {
            handleShowSnackbar("Por favor, selecione uma data válida", "error");
            return;
        }

        setLoading(true);

        const saveMethod = selectedId
            ? () => axios.put(`${import.meta.env.VITE_URL}/whitelist/${selectedId}`,
                { data: selectedDate },
                { headers: { Authorization: `Bearer ${token.accessToken}` } })
            : () => axios.post(`${import.meta.env.VITE_URL}/whitelist`,
                { data: selectedDate },
                { headers: { Authorization: `Bearer ${token.accessToken}` } });

        saveMethod()
            .then((res) => {
                setWhiteListData(prevData => {
                    // If creating a new entry
                    if (!selectedId) {
                        return [...prevData, {
                            id: res.data.id || (prevData.length > 0 ? Math.max(...prevData.map(d => d.id)) + 1 : 1),
                            data: res.data.whiteList.data || selectedDate
                        }];
                    }

                    // If updating existing entry
                    return prevData.map(item =>
                        item.id === selectedId
                            ? { ...item, data: selectedDate }
                            : item
                    );
                });

                handleShowSnackbar(
                    selectedId ? "Data atualizada com sucesso!" : "Data cadastrada com sucesso!",
                    "success"
                );

                // Reset form
                setSelectedId(null);
                setSelectedDate("");
            })
            .catch((err) => {
                handleShowSnackbar(
                    err.response?.data || (selectedId ? "Erro ao atualizar a data" : "Erro ao cadastrar a data"),
                    "error"
                );
            })
            .finally(() => setLoading(false));
    }, [selectedId, selectedDate, token.accessToken, handleShowSnackbar]);

    const handleDeleteDate = useCallback((id: number) => {
        setLoading(true);

        axios.delete(`${import.meta.env.VITE_URL}/whiteList/${id}`, {
            headers: { Authorization: `Bearer ${token.accessToken}` }
        })
            .then(() => {
                setWhiteListData(prevData =>
                    // Ensure prevData is an array before filtering
                    Array.isArray(prevData)
                        ? prevData.filter((item) => item.id !== id)
                        : []
                );
                handleShowSnackbar("Data excluída com sucesso!", "success");
            })
            .catch((err) => {
                handleShowSnackbar(
                    err.response?.data || "Erro ao excluir a data",
                    "error"
                );
            })
            .finally(() => setLoading(false));
    }, [token.accessToken, handleShowSnackbar]);

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 100,
            filterable: false,
            sortable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    color="primary"
                    variant="outlined"
                    size="small"
                />
            ),
        },
        {
            field: 'data',
            headerName: 'Data',
            flex: 1,
            minWidth: 200,
            filterable: true,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Typography noWrap sx={{ textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                    {params.value ? new Date(params.value + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                </Typography>
            ),
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            sortable: false,
            filterable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" justifyContent="center" gap={1}>
                    <IconButton
                        color="primary"
                        onClick={() => handleEditDate(params.row.id, params.row.data)}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={() => handleDeleteDate(params.row.id)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

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
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h4" component="h1">
                            Liberação de Datas
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <TextField
                            label="Data"
                            value={selectedDate || ''}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            fullWidth
                            type="date"
                            InputLabelProps={{ shrink: true }}
                        />
                        <Button sx={{ height: 55 }} variant="contained" color="primary" onClick={handleSaveDate}>
                            Salvar
                        </Button>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={whiteListData}
                            columns={columns}
                            rowHeight={35}
                            density="comfortable"
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[10, 25, 50, { value: -1, label: 'Todos os Registros' }]}
                            localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
                            disableColumnResize
                            disableRowSelectionOnClick
                            getRowId={(row) => row.id}
                            sx={{
                                height: 400,
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
                                    minHeight: '25px !important', // Force minimum height
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
    );
}