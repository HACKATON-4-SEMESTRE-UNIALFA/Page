import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Button, MenuItem, CircularProgress, Alert } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ReservaAmbiente = () => {
  const [ambienteId, setAmbienteId] = useState<string | null>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [ambientes, setAmbientes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Função para buscar os ambientes
  useEffect(() => {
    const fetchAmbientes = async () => {
      try {
        const response = await fetch('http://localhost:3001/ambientes');
        if (!response.ok) {
          throw new Error('Erro ao buscar os ambientes.');
        }
        const data = await response.json();
        setAmbientes(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchAmbientes();
  }, []);

  // Função para buscar os horários disponíveis
  const fetchAvailableTimes = useCallback(async (date: string) => {
    if (!ambienteId) return;

    try {
      setLoading(true);
      setError(null); 
      const response = await fetch(
        `http://localhost:3001/horarios_funcionamento?ambiente_id=${ambienteId}&date=${date}`
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar horários disponíveis.');
      }
      const data = await response.json();
      setAvailableTimes(data.map((item: { horario: string }) => item.horario));
    } catch (err: any) {
      setError(err.message); 
    } finally {
      setLoading(false);
    }
  }, [ambienteId]);

  // Lida com a seleção de data
  const handleDateChange = (newDate: Date | null) => {
    setSelectedDate(newDate);
    setSelectedTime(null); 
    if (newDate) {
      const formattedDate = newDate.toISOString().split('T')[0];
      fetchAvailableTimes(formattedDate);
    }
  };

  // Lida com o envio do formulário
  const handleSubmit = async () => {
    if (!ambienteId || !selectedDate || !selectedTime) {
      setError('Todos os campos devem ser preenchidos!');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ambiente_id: ambienteId,
        data: selectedDate.toISOString().split('T')[0],
        horario: selectedTime,
      };

      const response = await fetch('http://localhost:3001/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar a reserva.');
      }

      alert('Reserva realizada com sucesso!');
      setSelectedDate(null);
      setSelectedTime(null);
      setAmbienteId('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Adicionar Reserva</h1>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        select
        label="Ambientes"
        value={ambienteId || ''}
        onChange={(e) => setAmbienteId(e.target.value)}
        fullWidth
        style={{ marginBottom: '20px' }}
      >
        {ambientes.map((ambiente) => (
          <MenuItem key={ambiente.id} value={ambiente.id}>
            {ambiente.nome}
          </MenuItem>
        ))}
      </TextField>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Data"
          value={selectedDate}
          onChange={handleDateChange}
          slots={{ textField: (props) => <TextField {...props} fullWidth style={{ marginBottom: '20px' }} /> }}
        />
      </LocalizationProvider>

      {loading ? (
        <CircularProgress />
      ) : (
        <TextField
          select
          label="Horários Disponíveis"
          value={selectedTime || ''}
          onChange={(e) => setSelectedTime(e.target.value)}
          fullWidth
          style={{ marginBottom: '20px' }}
          disabled={!availableTimes.length}
        >
          {availableTimes.map((time, index) => (
            <MenuItem key={index} value={time}>
              {time}
            </MenuItem>
          ))}
        </TextField>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        fullWidth
        disabled={loading}
      >
        SALVAR
      </Button>
    </div>
  );
};

export default ReservaAmbiente;
