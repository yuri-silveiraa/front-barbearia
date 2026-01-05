import { useEffect, useState } from "react";
import { 
  getBarbers, 
  getServices, 
  getTimesByBarber, 
  criarReserva
} from "../../../api/reservas/reserva.service";

import { 
  Box, 
  Button, 
  MenuItem, 
  TextField, 
  Typography 
} from "@mui/material";

export default function CriarReservaPage() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [times, setTimes] = useState<any[]>([]);

  const [barberId, setBarberId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [timeId, setTimeId] = useState<any>("");

  const clientId = localStorage.getItem("clientId") || "";

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const barbersRes = await getBarbers();
    const servicesRes = await getServices();

    console.log("BARBEIROS:", barbersRes);
    console.log("SERVIÇOS:", servicesRes);
    setBarbers(barbersRes);
    setServices(servicesRes);
  };

  useEffect(() => {
    if (barberId) {
      loadTimes(barberId);
    }
  }, [barberId]);

  const loadTimes = async (id: string) => {
    const res = await getTimesByBarber(id);
    console.log("Horarios", res);
    setTimes(res);
  };

  const handleCreate = async () => {
    await criarReserva({
      barberId,
      clientId,
      serviceId,
      timeId
    });

    alert("Reserva criada com sucesso!");
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Criar Reserva
      </Typography>

      {/* BARBEIRO */}
      <TextField
        label="Selecione o barbeiro"
        select
        fullWidth
        margin="normal"
        value={barberId}
        onChange={(e) => setBarberId(e.target.value)}
      >
        {barbers.map((b: any) => (
          <MenuItem key={b.id} value={b.id}>
            {b.nome}
          </MenuItem>
        ))}
      </TextField>

      {/* SERVIÇO */}
      <TextField
        label="Serviço"
        select
        fullWidth
        margin="normal"
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
      >
        {services.map((s: any) => (
          <MenuItem key={s.id} value={s.id}>
            {s.nome} - R${s.preço} - {s.descrição}
          </MenuItem>
        ))}
      </TextField>

      {/* HORÁRIOS */}
      <TextField
        label="Horário"
        select
        fullWidth
        margin="normal"
        value={timeId}
        onChange={(e) => setTimeId(e.target.value)}
        disabled={!barberId}
      >
        {times.map((t: any) => (
          <MenuItem key={t.id} value={t.id}>
            {new Date(t.data).toLocaleString("pt-BR")}
          </MenuItem>
        ))}
      </TextField>

      <Button 
        variant="contained" 
        fullWidth 
        sx={{ mt: 3 }}
        disabled={!barberId || !serviceId || !timeId}
        onClick={handleCreate}
      >
        Criar Reserva
      </Button>
    </Box>
  );
}
