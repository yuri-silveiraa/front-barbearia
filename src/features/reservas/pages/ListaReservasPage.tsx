import { useEffect, useState } from "react";
import { getReservas, type Reserva } from "../../../api/reservas/reserva.service";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { statusMap } from "../types";

export function ListaReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const statusColor = {
    SCHEDULED: "cyan",
    COMPLETED: "green",
    CANCELED: "red",
  };

  async function carregar() {
    try {
      const response = await getReservas();
      setReservas(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Agendamentos
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        fullWidth
        onClick={() => navigate("/reservas/create")}
      >
        Novo Agendamento
      </Button>

      <Paper sx={{ p: 1 }}>
        <List>
          {reservas.map((r) => (
            <ListItem key={r.id} divider>
              <ListItemText
                primary={
                  <Typography component="div">
                    {r.client} com {r.barber} <br />
                    {r.service} <br />
                    <span style={{ color: statusColor[r.status] }}>Status: {statusMap[r.status]}</span>
                  </Typography>
                }
                secondary={new Date(r.time).toLocaleString("pt-BR")}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
