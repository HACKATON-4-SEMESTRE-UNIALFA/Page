import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  List, 
  ListItem, 
  CircularProgress, 
  Box, 
  Typography,
  Container,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const DatePickerR = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Função para buscar horários disponíveis
  const fetchAvailableTimes = async (date) => {
    setLoading(true);
    setError(null);
    try {
      // Simulando uma chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulando horários disponíveis - substitua pela sua chamada real à API
      const mockTimes = [
        '09:00-09:59',
        '10:00-10:59',
        '11:00-11:59',
        '14:00-14:59',
        '15:00-15:59',
        '16:00-16:59'
      ];
      
      setAvailableTimes(mockTimes);
    } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para lidar com a seleção de uma data
  const handleDateChange = (newDate: any) => {
    setSelectedDate(newDate);
    setSelectedTime(null); // Reseta o horário selecionado
    if (newDate) {
      fetchAvailableTimes(newDate.toISOString().split('T')[0]); // Formato YYYY-MM-DD
    }
  };

  // Função para lidar com a seleção de horário
  const handleTimeSelect = (time: any) => {
    setSelectedTime(time);
  };

  // Função para salvar a reserva
  const handleSaveReservation = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      // Aqui você faria a chamada para sua API para salvar a reserva
      const reservationData = {
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime
      };

      console.log('Salvando reserva:', reservationData);
      
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Limpar formulário após sucesso
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableTimes([]);
      
      alert('Reserva realizada com sucesso!');
    } catch (err) {
      setError('Erro ao salvar a reserva. Tente novamente.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Reservar Ambiente
        </Typography>

        <Box sx={{ mb: 3 }}>
          <DatePicker
            label="Selecione a Data"
            value={selectedDate}
            onChange={handleDateChange}
            renderInput={(params) => <TextField {...params} fullWidth />}
            disablePast
            maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 dias à frente
          />
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ my: 2 }}>
            <Typography color="error" align="center">
              {error}
            </Typography>
          </Box>
        )}

        {selectedDate && availableTimes.length > 0 && (
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" gutterBottom>
              Horários disponíveis para {selectedDate.toLocaleDateString()}:
            </Typography>
            <List sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {availableTimes.map((time) => (
                <ListItem key={time} sx={{ padding: 0.5 }}>
                  <Button
                    variant={selectedTime === time ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {selectedDate && availableTimes.length === 0 && !loading && (
          <Typography variant="body1" color="textSecondary" align="center" sx={{ my: 2 }}>
            Nenhum horário disponível para esta data.
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={!selectedDate || !selectedTime}
            onClick={handleSaveReservation}
          >
            Salvar Reserva
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DatePickerR;