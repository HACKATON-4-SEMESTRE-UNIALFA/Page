import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback } from "react";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100vw",
  height: "100vh",
};

const modalContentStyle = {
  width: { xs: "90vw", sm: "80vw", md: "70vw" },
  maxHeight: "85vh",
  bgcolor: "background.paper",
  border: "2px solid #ffffff",
  borderRadius: 8,
  boxShadow: 24,
  p: 2,
  overflow: "hidden",
};

// Componente do Modal
export default function HistoricoModal({
  historico,
  open,
  handleClose,
}: {
  historico: Array<{
    id_reserva: number;
    nome_alteracao: string;
    ambiente: string;
    horario: string;
    data: string;
    status: string;
    created_at: string;
  }>;
  open: boolean;
  handleClose: () => void;
}) {
  const ordenarPorData = useCallback(
    (historico: Array<{
      id_reserva: number;
      nome_alteracao: string;
      ambiente: string;
      horario: string;
      data: string;
      status: string;
      created_at: string;
    }>) =>
      historico.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    []
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      sx={style}
    >
      <Box sx={modalContentStyle}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography
            id="modal-title"
            variant="h6"
            component="h2"
            textAlign="center"
            sx={{ mt: 0.60, ml: 1 }}
          >
            Histórico da Reserva
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            overflowY: "auto",
            maxHeight: "70vh",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "Ambiente",
                  "Horário",
                  "Data",
                  "Status",
                  "Alterado por",
                  "Alterado em",
                ].map((header, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      color: "white",
                      textAlign: "center",
                      fontSize: "1rem",
                      backgroundColor: 'primary.main'
                    }}
                  >
                    <strong>{header}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenarPorData(historico).map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {item.ambiente}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {item.horario}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {new Date(item.data).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {item.status}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {item.nome_alteracao}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {new Date(item.created_at).toLocaleString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
}
