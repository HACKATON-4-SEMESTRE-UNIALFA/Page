import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90vw", sm: 400 },
  bgcolor: "background.paper",
  border: "2px solid #ffffff",
  borderRadius: 8,
  boxShadow: 24,
  p: 4,
  "@media (max-width: 600px)": {
    padding: 2,
  },
};

export default function CancelamentoModal({
  open,
  handleClose,
  onSave,
}: {
  open: boolean;
  handleClose: () => void;
  onSave: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");

  const handleSaveClick = () => {
    onSave(motivo); // Passa o motivo para o componente pai
    setMotivo(""); // Reseta o campo de texto
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 2 }} gutterBottom>
          Cancelar Reserva
        </Typography>
        <TextField
          label="Motivo do Cancelamento"
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveClick}
            disabled={!motivo.trim()} // Desabilita o botão se o campo estiver vazio
          >
            Salvar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
