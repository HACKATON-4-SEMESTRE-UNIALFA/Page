import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
  } from '@mui/material';
  
  interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
  }
  
  export const ConfirmationDialog = ({
    open,
    title,
    message,
    onConfirm,
    onClose
  }: ConfirmationDialogProps) => {
    return (
      <Dialog
        open={open}
        onClose={onClose}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Não
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            color="error"
            autoFocus
          >
            Sim
          </Button>
        </DialogActions>
      </Dialog>
    );
  };