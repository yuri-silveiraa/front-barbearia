import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Chip
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getBarberTodayAppointments, attendAppointment, cancelAppointment } from "../barbeiro.service";
import type { BarberAppointment } from "../types";

export default function DetalhesAgendamentoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<BarberAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const data = await getBarberTodayAppointments();
      const found = data.find((apt) => apt.id === id);
      setAppointment(found || null);
      if (!found) {
        setError("Agendamento não encontrado");
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : "Erro ao carregar agendamento";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAttend = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await attendAppointment(id);
      navigate("/agenda");
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : "Erro ao concluir agendamento";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await cancelAppointment(id);
      navigate("/agenda");
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : "Erro ao cancelar agendamento";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
      setCancelDialogOpen(false);
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

  const formatDate = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !appointment) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", px: 2, py: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/agenda")} sx={{ mb: 2 }}>
          Voltar
        </Button>
        <Alert severity="error">{error || "Agendamento não encontrado"}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: 2, py: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/agenda")} sx={{ mb: 2 }}>
        Voltar
      </Button>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>
            Detalhes do Agendamento
          </Typography>
          <Chip
            label={appointment.status === "SCHEDULED" ? "Agendado" : appointment.status === "COMPLETED" ? "Atendido" : "Cancelado"}
            color={appointment.status === "SCHEDULED" ? "default" : appointment.status === "COMPLETED" ? "success" : "error"}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <AccessTimeIcon color="primary" />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Horário
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {formatTime(appointment.time)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(appointment.time)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <PersonIcon color="primary" />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Cliente
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {appointment.client}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <ContentCutIcon color="primary" />
          <Box>
            <Typography variant="body2" color="text.secondary">
              Serviço
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {appointment.service}
            </Typography>
          </Box>
        </Box>

        {appointment.status === "SCHEDULED" && (
          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={handleAttend}
              disabled={actionLoading}
              fullWidth
            >
              {actionLoading ? "Processando..." : "Concluir"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setCancelDialogOpen(true)}
              disabled={actionLoading}
              fullWidth
            >
              Cancelar
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancelar Agendamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Não</Button>
          <Button onClick={handleCancel} color="error" autoFocus>
            Sim, Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
