import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  Button
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getBarberAppointmentsByRange } from "../../../api/barbeiro/barbeiro.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import type { BarberAppointment } from "../../../api/barbeiro/types";

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

export default function AgendaBarbeiroPeriodoPage() {
  const [appointments, setAppointments] = useState<BarberAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [endDate, setEndDate] = useState(dayjs().startOf("day"));

  const grouped = useMemo(() => {
    const map = new Map<string, BarberAppointment[]>();
    appointments.forEach((appointment) => {
      const day = dayjs(appointment.time).format("YYYY-MM-DD");
      const list = map.get(day) ?? [];
      list.push(appointment);
      map.set(day, list);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1));
  }, [appointments]);

  const loadAppointments = async () => {
    if (!startDate || !endDate) return;
    if (endDate.isBefore(startDate, "day")) {
      setError("Data final deve ser maior ou igual à inicial.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getBarberAppointmentsByRange(
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD")
      );
      setAppointments(data || []);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Erro ao carregar agendamentos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: { xs: 2, sm: 3 }, py: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError(null)} />
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, textAlign: "center" }}>
        Agenda por Período
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        Selecione o período e visualize os agendamentos
      </Typography>

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <DatePicker
                label="Início"
                value={startDate}
                onChange={(value) => value && setStartDate(value)}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <DatePicker
                label="Fim"
                value={endDate}
                onChange={(value) => value && setEndDate(value)}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }} display="flex" alignItems="center">
              <Button variant="contained" fullWidth onClick={loadAppointments}>
                Buscar
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && grouped.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <CalendarMonthIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum agendamento no período
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Ajuste o período e tente novamente
          </Typography>
        </Paper>
      )}

      {grouped.map(([dateKey, dayAppointments]) => (
        <Box key={dateKey} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            {dayjs(dateKey).format("DD/MM/YYYY")}
          </Typography>

          {dayAppointments.map((appointment) => (
            <Card key={appointment.id} sx={{ mb: 2, borderRadius: 3 }}>
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
              </CardContent>
            </Card>
          ))}
        </Box>
      ))}
    </Box>
  );
}
