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
import { set } from "immutable";

interface IWhiteList {
    id: number;
    data: string;
}

export default function WhiteList() {
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const [loading, setLoading] = useState(false);
    const [whitelistData, setWhitelistData] = useState<Array<IWhiteList>>([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");

    const handleShowSnackbar = useCallback((
        message: string,
        severity: 'success' | 'error' | 'warning' | 'info'
    ) => {
        setSnackbarVisible(true);
        setMessage(message);
        setSeverity(severity);
    }, [setSnackbarVisible, setMessage, setSeverity]);

    useEffect(() => {
        setLoading(true);

        axios.get(import.meta.env.VITE_URL + '/whitelist')
            .then((res) => {
                setWhitelistData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                handleShowSnackbar(err.response?.data || "Erro ao carregar dados", 'error');
            });
    }, []);

    const handleEditDate = useCallback((id: number, date: string) => {
        setSelectedId(id);
        setSelectedDate(date);
    }, []);

    const handleSaveDate = useCallback(() => {
        if (!selectedId) return;

        setLoading(true);

        axios.put(`${import.meta.env.VITE_URL}/whitelist/${selectedId}`, { data: selectedDate })
            .then(() => {
                setWhitelistData((prev) =>
                    prev.map((item) =>
                        item.id === selectedId ? { ...item, data: selectedDate } : item
                    )
                );
                handleShowSnackbar("Data atualizada com sucesso!", "success");
                setSelectedId(null);
                setSelectedDate("");
            })
            .catch((err) => {
                handleShowSnackbar(err.response?.data || "Erro ao atualizar a data", "error");
            })
            .finally(() => setLoading(false));
    }, [selectedId, selectedDate, setWhitelistData, handleShowSnackbar]);

    const handleDeleteDate = useCallback((id: number) => {
        setLoading(true);

        axios.delete(`${import.meta.env.VITE_URL}/whitelist/${id}`)
            .then(() => {
                setWhitelistData((prev) => prev.filter((item) => item.id !== id));
                handleShowSnackbar("Data excluída com sucesso!", "success");
            })
            .catch((err) => {
                handleShowSnackbar(err.response?.data || "Erro ao excluir a data", "error");
            })
            .finally(() => setLoading(false));
    }, [setWhitelistData, handleShowSnackbar]);

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
                    {new Date(params.value).toLocaleDateString("pt-BR")}
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
                    {/* Botão de editar */}
                    <IconButton
                        color="primary"
                        onClick={() => handleEditDate(params.row.id, params.row.data)}
                    >
                        <EditIcon />
                    </IconButton>
                    {/* Botão de excluir */}
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
                            WhiteList de Datas
                        </Typography>
                    </Box>

                    {/* Campo de edição */}
                    {selectedId && (
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <TextField
                                label="Editar Data"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                fullWidth
                                type="date"
                            />
                            <Button variant="contained" color="primary" onClick={handleSaveDate}>
                                Salvar
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={whitelistData}
                            columns={columns}
                            rowHeight={60}
                            density="standard"
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
                            }}
                        />
                    </Box>
                </Container>
            </LayoutDashboard>
        </>
    );
}
