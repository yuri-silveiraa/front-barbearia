import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PaidIcon from "@mui/icons-material/Paid";
import PersonIcon from "@mui/icons-material/Person";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { getBarberAppointmentsByRange, getBarberFinanceByRange } from "../../../api/barbeiro/barbeiro.service";
import { getServices } from "../../../api/servicos/servico.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { AppointmentListSkeleton, MetricsSkeleton } from "../../../components/skeletons/AppSkeletons";
import type { BarberAppointment } from "../../../api/barbeiro/types";
import type { Service } from "../../servicos/types";
import { buildWhatsappUrl, formatWhatsappDisplay } from "../../../utils/customerInput";

dayjs.locale("pt-br");

const statusColors: Record<string, "primary" | "success" | "error"> = {
  SCHEDULED: "primary",
  COMPLETED: "success",
  CANCELED: "error",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendado",
  COMPLETED: "Atendido",
  CANCELED: "Cancelado",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatTime(timeStr: string) {
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return timeStr;
  }
}

export default function AgendaBarbeiroPeriodoPage() {
  const [appointments, setAppointments] = useState<BarberAppointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<BarberAppointment | null>(null);
  const [periodRevenue, setPeriodRevenue] = useState(0);
  const [revenueAppointmentsCount, setRevenueAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [endDate, setEndDate] = useState(dayjs().startOf("day"));
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [appliedRange, setAppliedRange] = useState({
    start: dayjs().startOf("day"),
    end: dayjs().startOf("day"),
    serviceId: "",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const loadAppointments = useCallback(async () => {
    if (!appliedRange.start || !appliedRange.end) return;
    if (appliedRange.end.isBefore(appliedRange.start, "day")) {
      setError("Data final deve ser maior ou igual à inicial.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const start = appliedRange.start.format("YYYY-MM-DD");
      const end = appliedRange.end.format("YYYY-MM-DD");
      const serviceId = appliedRange.serviceId || undefined;
      const [appointmentsData, financeData, servicesData] = await Promise.all([
        getBarberAppointmentsByRange(start, end, serviceId),
        getBarberFinanceByRange(start, end, serviceId).catch(() => null),
        getServices().catch(() => []),
      ]);

      setAppointments(appointmentsData || []);
      setServices(servicesData);
      setPeriodRevenue(financeData?.totalRevenue ?? 0);
      setRevenueAppointmentsCount(financeData?.appointments?.length ?? 0);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Erro ao carregar agendamentos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [appliedRange.end, appliedRange.serviceId, appliedRange.start]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const grouped = useMemo(() => {
    const map = new Map<string, BarberAppointment[]>();
    appointments.forEach((appointment) => {
      const day = dayjs(appointment.time).format("YYYY-MM-DD");
      const list = map.get(day) ?? [];
      list.push(appointment);
      map.set(day, list);
    });

    return Array.from(map.entries())
      .sort((a, b) => (a[0] > b[0] ? 1 : -1))
      .map(([date, dayAppointments]) => ({
        date,
        appointments: dayAppointments.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
      }));
  }, [appointments]);

  const scheduledCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "SCHEDULED").length,
    [appointments]
  );
  const completedCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "COMPLETED").length,
    [appointments]
  );
  const canceledCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "CANCELED").length,
    [appointments]
  );
  const periodLabel = `${appliedRange.start.format("DD/MM")} - ${appliedRange.end.format("DD/MM")}`;
  const appliedService = useMemo(
    () => services.find((service) => service.id === appliedRange.serviceId),
    [appliedRange.serviceId, services]
  );
  const appliedServiceLabel = appliedService?.nome ?? "Todos os serviços";
  const selectedPrice = selectedAppointment?.price;
  const selectedWhatsappUrl = selectedAppointment ? buildWhatsappUrl(selectedAppointment.clientTelephone) : null;
  const selectedWhatsappLabel =
    selectedAppointment && selectedAppointment.clientTelephone
      ? formatWhatsappDisplay(selectedAppointment.clientTelephone)
      : "WhatsApp não informado";

  const handleApplyFilter = () => {
    if (endDate.isBefore(startDate, "day")) {
      setError("Data final deve ser maior ou igual à inicial.");
      return;
    }
    setAppliedRange({ start: startDate, end: endDate, serviceId: selectedServiceId });
  };

  const formatDate = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString("pt-BR", {
        weekday: isMobile ? "short" : "long",
        day: "numeric",
        month: isMobile ? "2-digit" : "long",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 900, mx: "auto", pb: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError(null)} />

      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
          Histórico
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: 28, sm: 34 },
            fontWeight: 800,
            lineHeight: 1.05,
            mb: 1,
          }}
        >
          Agendamentos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consulte atendimentos por período, status e faturamento.
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
          <Chip label={periodLabel} size="small" variant="outlined" />
          <Chip label={appliedServiceLabel} size="small" variant="outlined" />
        </Stack>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <DatePicker
              label="Início"
              value={startDate}
              format="DD-MM-YYYY"
              onChange={(value) => value && setStartDate(value)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
            <DatePicker
              label="Fim"
              value={endDate}
              format="DD-MM-YYYY"
              onChange={(value) => value && setEndDate(value)}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
            <TextField
              select
              label="Serviço"
              value={selectedServiceId}
              onChange={(event) => setSelectedServiceId(event.target.value)}
              size="small"
              sx={{ minWidth: { sm: 220 } }}
            >
              <MenuItem value="">Todos os serviços</MenuItem>
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.nome}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={handleApplyFilter}
              disabled={loading}
              sx={{ minHeight: 40, px: 3, borderRadius: 2, flexShrink: 0 }}
            >
              Buscar
            </Button>
          </Stack>
        </LocalizationProvider>
      </Paper>

      {loading ? (
        <MetricsSkeleton count={4} columns={{ xs: "1fr 1fr", sm: "repeat(4, 1fr)" }} minHeight={92} />
      ) : (
        <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 1,
          mb: 2,
        }}
      >
        {[
          { label: "Agendados", value: scheduledCount, icon: <AccessTimeIcon fontSize="small" /> },
          { label: "Atendidos", value: completedCount, icon: <DoneAllIcon fontSize="small" /> },
          { label: "Cancelados", value: canceledCount, icon: <EventBusyIcon fontSize="small" /> },
          {
            label: revenueAppointmentsCount === 1 ? "1 atendimento" : `${revenueAppointmentsCount} atendimentos`,
            value: formatCurrency(periodRevenue),
            icon: <PaidIcon fontSize="small" />,
            featured: true,
          },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: { xs: 1.25, sm: 1.75 },
              minHeight: 92,
              border: "1px solid",
              borderColor: item.featured ? "rgba(37, 208, 179, 0.45)" : "divider",
              borderRadius: 2,
              bgcolor: item.featured ? "rgba(0, 191, 165, 0.08)" : "background.paper",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ color: item.featured ? "primary.main" : "text.secondary", display: "flex" }}>
              {item.icon}
            </Box>
            <Box>
              <Typography variant={item.featured ? "subtitle1" : "h6"} fontWeight={800} lineHeight={1.1}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          </Paper>
        ))}
        </Box>
      )}

      {loading && (
        <Stack spacing={2}>
          <AppointmentListSkeleton rows={3} />
          <AppointmentListSkeleton rows={2} />
        </Stack>
      )}

      {!loading && grouped.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <CalendarMonthIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum agendamento no período
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Ajuste o período e tente novamente.
          </Typography>
        </Paper>
      )}

      {!loading && grouped.length > 0 && (
        <Stack spacing={2}>
          {grouped.map((group) => (
            <Paper
              key={group.date}
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 1 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                  {dayjs(group.date).format(isMobile ? "DD/MM" : "DD/MM/YYYY")}
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {group.appointments.length} {group.appointments.length === 1 ? "agendamento" : "agendamentos"}
                </Typography>
              </Box>

              <Stack divider={<Divider flexItem />}>
                {group.appointments.map((appointment) => {
                  const isScheduled = appointment.status === "SCHEDULED";
                  return (
                    <Box
                      key={appointment.id}
                      component="button"
                      onClick={() => setSelectedAppointment(appointment)}
                      sx={{
                        width: "100%",
                        border: 0,
                        bgcolor: "transparent",
                        color: "inherit",
                        textAlign: "left",
                        p: { xs: 2, sm: 2.5 },
                        display: "grid",
                        gridTemplateColumns: "64px minmax(0, 1fr) auto",
                        gap: { xs: 1.5, sm: 2 },
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={800} lineHeight={1}>
                          {formatTime(appointment.time)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          horário
                        </Typography>
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography fontWeight={700} noWrap>
                            {appointment.client}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <ContentCutIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {appointment.service}
                          </Typography>
                        </Box>
                      </Box>

                      <Stack spacing={1} alignItems="flex-end">
                        <Chip
                          label={statusLabels[appointment.status]}
                          color={statusColors[appointment.status]}
                          size="small"
                          variant={isScheduled ? "filled" : "outlined"}
                          sx={{ fontWeight: 700 }}
                        />
                        <ArrowForwardIcon color="primary" fontSize="small" />
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog
        open={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            m: { xs: 1.5, sm: 3 },
          },
        }}
      >
        {selectedAppointment && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                    Agendamento
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {selectedAppointment.client}
                  </Typography>
                </Box>
                <Chip
                  label={statusLabels[selectedAppointment.status]}
                  color={statusColors[selectedAppointment.status]}
                  size="small"
                  sx={{ fontWeight: 700, mt: 0.5 }}
                />
              </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
              <Stack spacing={2} divider={<Divider flexItem />}>
                <Box sx={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: 1.5 }}>
                  <AccessTimeIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Dia e horário
                    </Typography>
                    <Typography fontWeight={800}>{formatTime(selectedAppointment.time)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(selectedAppointment.time)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: 1.5 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Cliente
                    </Typography>
                    <Typography fontWeight={800}>{selectedAppointment.client}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedWhatsappLabel}
                    </Typography>
                    {selectedWhatsappUrl && (
                      <Button
                        href={selectedWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<WhatsAppIcon />}
                        variant="outlined"
                        size="small"
                        fullWidth={isMobile}
                        sx={{
                          mt: 1,
                          justifyContent: "center",
                          borderColor: "rgba(37, 211, 102, 0.45)",
                          color: "#128C7E",
                          "&:hover": {
                            borderColor: "#128C7E",
                            bgcolor: "rgba(37, 211, 102, 0.08)",
                          },
                        }}
                      >
                        Chamar no WhatsApp
                      </Button>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: 1.5 }}>
                  <ContentCutIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Serviço
                    </Typography>
                    <Typography fontWeight={800}>{selectedAppointment.service}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPrice !== undefined ? formatCurrency(selectedPrice) : "Valor não informado"}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button variant="contained" onClick={() => setSelectedAppointment(null)} fullWidth>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
