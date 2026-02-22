import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getBarberTodayAppointments } from "../barbeiro.service";
import type { BarberAppointment } from "../types";

const statusColors: Record<string, "default" | "success" | "error"> = {
  SCHEDULED: "default",
  COMPLETED: "success",
  CANCELED: "error",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendado",
  COMPLETED: "Atendido",
  CANCELED: "Cancelado",
};

export default function AgendaBarbeiroPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<BarberAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBarberTodayAppointments();
      setAppointments(data || []);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : "Erro ao carregar agendamentos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 2, sm: 3 }, py: 2 }}>
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, textAlign: "center" }}>
        Agenda do Dia
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && appointments.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <CalendarMonthIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum agendamento para hoje
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Volte mais tarde ou amanhã
          </Typography>
        </Paper>
      )}

      {appointments.map((appointment) => (
        <Card
          key={appointment.id}
          sx={{
            mb: 2,
            borderRadius: 3,
            cursor: appointment.status === "SCHEDULED" ? "pointer" : "default",
            transition: "all 0.2s ease",
            "&:hover": appointment.status === "SCHEDULED" ? {
              transform: "translateY(-2px)",
              boxShadow: 3
            } : {}
          }}
          onClick={() => {
            if (appointment.status === "SCHEDULED") {
              navigate(`/agenda/${appointment.id}`);
            }
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon color="primary" fontSize="small" />
                <Typography variant="h6" fontWeight={600}>
                  {formatTime(appointment.time)}
                </Typography>
              </Box>
              <Chip
                label={statusLabels[appointment.status]}
                color={statusColors[appointment.status]}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body1">
                {appointment.client}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ContentCutIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {appointment.service}
              </Typography>
            </Box>

            {appointment.status === "SCHEDULED" && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                <IconButton size="small" color="primary">
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
