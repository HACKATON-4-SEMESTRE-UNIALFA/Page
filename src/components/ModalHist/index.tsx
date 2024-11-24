import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useCallback } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "100vw", sm: 800 },
  bgcolor: "background.paper",
  border: "2px solid #ffffff",
  borderRadius: 8,
  boxShadow: 24,
  p: 4,
  "@media (max-width: 600px)": {
    padding: 2,
  },
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
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2" textAlign="center" gutterBottom>
          Histórico da Reserva
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
          <Table>
            <TableHead sx={{ bgcolor: "primary.main" }}>
              <TableRow >
                <TableCell sx={{ color: "white", textAlign: "center" }}><strong>Ambiente</strong></TableCell>
                <TableCell sx={{ color: "white", textAlign: "center" }}><strong>Horário</strong></TableCell>
                <TableCell sx={{ color: "white", textAlign: "center" }}><strong>Data</strong></TableCell>
                <TableCell sx={{ color: "white", textAlign: "center" }}><strong>Status</strong></TableCell>
                <TableCell sx={{ color: "white", textAlign: "center" }}><strong>Alterado por</strong></TableCell>
                <TableCell sx={{ color: "white", textAlign: "center" }}><strong>Alterado em</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenarPorData(historico).map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ textAlign: "center" }}>{item.ambiente}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{item.horario}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{new Date(item.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{item.status}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{item.nome_alteracao}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{new Date(item.created_at).toLocaleString("pt-BR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Modal>
  );
}


