import { useEffect, useState, useRef } from "react";
import { getReservas } from "../../../api/reservas/reserva.service";
import type { Reserva } from "../types";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Chip,
  Avatar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";

export function ListaReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const getStatusConfig = (status: string) => {
    const configs = {
      SCHEDULED: { color: "info" as const, bgcolor: "rgba(0, 191, 165, 0.15)", label: "Agendada" },
      COMPLETED: { color: "success" as const, bgcolor: "rgba(76, 175, 80, 0.15)", label: "Atendida" },
      CANCELED: { color: "error" as const, bgcolor: "rgba(244, 67, 54, 0.15)", label: "Cancelada" }
    };
    return configs[status as keyof typeof configs] || configs.SCHEDULED;
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
    if (hasFetched.current) return;
    hasFetched.current = true;
    carregar();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1, sm: 2 } }}>
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between", 
        alignItems: { xs: "flex-start", sm: "center" }, 
        mb: 3,
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Minhas Reservas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie seus agendamentos
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/reservas/create")}
          sx={{ px: { xs: 2, sm: 3 }, py: 1, fontWeight: 600, width: { xs: "100%", sm: "auto" } }}
        >
          Nova Reserva
        </Button>
      </Box>

      {reservas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "background.paper",
            border: "2px dashed",
            borderColor: "divider"
          }}
        >
          <Box
            sx={{
              width: { xs: 60, sm: 80 },
              height: { xs: 60, sm: 80 },
              borderRadius: "50%",
              bgcolor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2
            }}
          >
            <ScheduleIcon sx={{ fontSize: { xs: 30, sm: 40 }, color: "text.secondary" }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Nenhuma reserva ainda
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Agende seu primeiro atendimento na barbearia
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/reservas/create")}
          >
            Criar Reserva
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {reservas.map((reserva) => {
            const statusConfig = getStatusConfig(reserva.status);
            
            return (
              <Paper
                key={reserva.id}
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  backgroundColor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 20px rgba(0, 191, 165, 0.15)"
                  }
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                  <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
                    <Avatar
                      sx={{
                        width: { xs: 44, sm: 56 },
                        height: { xs: 44, sm: 56 },
                        bgcolor: "primary.main",
                        fontSize: { xs: "1rem", sm: "1.5rem" }
                      }}
                    >
                      <ContentCutIcon />
                    </Avatar>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                        {reserva.service}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {reserva.barber}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(reserva.time).toLocaleString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Chip
                    label={statusConfig.label}
                    color={statusConfig.color}
                    size="small"
                    sx={{ fontWeight: 600, alignSelf: { xs: "flex-start", sm: "center" } }}
                  />
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
