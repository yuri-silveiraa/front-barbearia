import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PaidIcon from "@mui/icons-material/Paid";
import PersonIcon from "@mui/icons-material/Person";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { getServices } from "../../../api/servicos/servico.service";
import { getBarberFinanceByRange, getBarberTodayAppointments } from "../../../api/barbeiro/barbeiro.service";
import { attendAppointment, cancelAppointment, createManualAppointment, getMyTimeSlots } from "../../../api/barbeiro/barbeiro.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import type { BarberAppointment, TimeSlot } from "../../../api/barbeiro/types";
import type { Service } from "../../servicos/types";
import {
  buildWhatsappUrl,
  formatWhatsapp,
  formatWhatsappDisplay,
  normalizeCustomerName,
  onlyLettersAndSpaces,
} from "../../../utils/customerInput";

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

function formatTime(timeStr: string) {
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return timeStr;
  }
}

function getSlotDate(slot: TimeSlot): string {
  return slot.date || slot.data || "";
}

function formatSlotLabel(slot: TimeSlot) {
  const value = getSlotDate(slot);
  if (!value) return "Horário sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AgendaBarbeiroPage() {
  const [appointments, setAppointments] = useState<BarberAppointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});
  const [selectedAppointment, setSelectedAppointment] = useState<BarberAppointment | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [dailyPaymentsCount, setDailyPaymentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: "",
    customerWhatsapp: "",
    serviceId: "",
    timeId: "",
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const today = formatDateForApi(new Date());
      const [appointmentsData, financeData, servicesData, timeSlotsData] = await Promise.all([
        getBarberTodayAppointments(),
        getBarberFinanceByRange(today, today),
        getServices().catch(() => []),
        getMyTimeSlots().catch(() => []),
      ]);
      const revenueAppointments = financeData.appointments || [];
      setAppointments(appointmentsData || []);
      setServices(servicesData);
      setTimeSlots(timeSlotsData.filter((slot) => slot.disponible !== false));
      setServicePrices(
        servicesData.reduce<Record<string, number>>((prices, service) => {
          const value = typeof service.preço === "string" ? Number(service.preço) : service.preço;
          prices[service.id] = Number.isFinite(value) ? value : 0;
          return prices;
        }, {})
      );
      setDailyPaymentsCount(revenueAppointments.length);
      setDailyRevenue(revenueAppointments.reduce((total, appointment) => total + appointment.amount, 0));
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Erro ao carregar agendamentos";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const orderedAppointments = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()),
    [appointments]
  );
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
  const nextAppointment = useMemo(
    () => orderedAppointments.find((appointment) => appointment.status === "SCHEDULED"),
    [orderedAppointments]
  );
  const todayLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: isMobile ? "short" : "long",
    day: "numeric",
    month: isMobile ? "2-digit" : "long",
  });
  const selectedPrice = selectedAppointment ? selectedAppointment.price ?? servicePrices[selectedAppointment.serviceId] : undefined;
  const selectedWhatsappUrl = selectedAppointment ? buildWhatsappUrl(selectedAppointment.clientTelephone) : null;
  const selectedWhatsappLabel =
    selectedAppointment && selectedAppointment.clientTelephone
      ? formatWhatsappDisplay(selectedAppointment.clientTelephone)
      : "WhatsApp não informado";

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

  const handleAttend = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      await attendAppointment(selectedAppointment.id);
      setSelectedAppointment(null);
      await loadAppointments();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Erro ao concluir agendamento";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      await cancelAppointment(selectedAppointment.id);
      setSelectedAppointment(null);
      await loadAppointments();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Erro ao cancelar agendamento";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
      setCancelDialogOpen(false);
    }
  };


  const resetManualForm = () => {
    setManualForm({ customerName: "", customerWhatsapp: "", serviceId: "", timeId: "" });
  };

  const handleManualSubmit = async () => {
    const customerName = normalizeCustomerName(manualForm.customerName);
    const customerWhatsapp = manualForm.customerWhatsapp.replace(/\D/g, "");

    if (!customerName || customerName.length < 2) {
      setError("Informe o nome do cliente");
      return;
    }
    if (customerWhatsapp.length < 10) {
      setError("Informe um WhatsApp válido");
      return;
    }
    if (!manualForm.serviceId || !manualForm.timeId) {
      setError("Selecione serviço e horário");
      return;
    }

    try {
      setManualLoading(true);
      setError(null);
      await createManualAppointment({
        customerName,
        customerWhatsapp,
        serviceId: manualForm.serviceId,
        timeId: manualForm.timeId,
      });
      setManualDialogOpen(false);
      resetManualForm();
      setSuccess("Agendamento criado para o cliente sem conta.");
      await loadAppointments();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Erro ao criar agendamento";
      setError(errorMessage);
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 760, mx: "auto", pb: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError(null)} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess(null)} />

      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
          Agenda
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
          Hoje
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {todayLabel}
            </Typography>
            <Chip
              label={`${appointments.length} no dia`}
              size="small"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setManualDialogOpen(true)}
            sx={{ borderRadius: 999, px: { xs: 1.5, sm: 2.5 }, flexShrink: 0 }}
          >
            {isMobile ? "Agendar" : "Agendar cliente"}
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              mb: 2,
            }}
          >
            {[
              { label: "A fazer", value: scheduledCount, icon: <AccessTimeIcon fontSize="small" /> },
              { label: "Atendidos", value: completedCount, icon: <DoneAllIcon fontSize="small" /> },
              { label: "Cancelados", value: canceledCount, icon: <EventBusyIcon fontSize="small" /> },
            ].map((item) => (
              <Paper
                key={item.label}
                elevation={0}
                sx={{
                  p: { xs: 1.25, sm: 1.75 },
                  minHeight: 88,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ color: "text.secondary", display: "flex" }}>{item.icon}</Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} lineHeight={1}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          {nextAppointment && (
            <Paper
              elevation={0}
              onClick={() => setSelectedAppointment(nextAppointment)}
              sx={{
                p: { xs: 2, sm: 2.5 },
                mb: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "rgba(37, 208, 179, 0.45)",
                bgcolor: "rgba(0, 191, 165, 0.08)",
                cursor: "pointer",
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                Próximo atendimento
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 0.5 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" fontWeight={800}>
                    {formatTime(nextAppointment.time)}
                  </Typography>
                  <Typography fontWeight={700} noWrap>
                    {nextAppointment.client}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {nextAppointment.service}
                  </Typography>
                </Box>
                <IconButton color="primary" sx={{ alignSelf: "center", flexShrink: 0 }}>
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </Paper>
          )}

          {orderedAppointments.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhum agendamento para hoje
              </Typography>
              <Typography variant="body2" color="text.disabled">
                A agenda está livre neste momento.
              </Typography>
            </Paper>
          )}

          {orderedAppointments.length > 0 && (
            <Paper
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
                  Lista do dia
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  Atendimentos
                </Typography>
              </Box>

              <Stack divider={<Divider flexItem />}>
                {orderedAppointments.map((appointment) => {
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
                        {isScheduled && <ArrowForwardIcon color="primary" fontSize="small" />}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "rgba(37, 208, 179, 0.45)",
              bgcolor: "rgba(0, 191, 165, 0.08)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                  Faturamento do dia
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {formatCurrency(dailyRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dailyPaymentsCount} {dailyPaymentsCount === 1 ? "pagamento recebido" : "pagamentos recebidos"}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: "rgba(0, 191, 165, 0.16)",
                  color: "primary.main",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <PaidIcon />
              </Box>
            </Box>
          </Paper>
        </>
      )}

      <Dialog
        open={!!selectedAppointment}
        onClose={() => !actionLoading && setSelectedAppointment(null)}
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

            <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
              {selectedAppointment.status === "SCHEDULED" && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAttend}
                    disabled={actionLoading}
                    fullWidth
                  >
                    {actionLoading ? "Processando..." : "Concluir"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={actionLoading}
                    fullWidth
                  >
                    Cancelar
                  </Button>
                </>
              )}
              <Button
                variant={selectedAppointment.status === "SCHEDULED" ? "text" : "contained"}
                onClick={() => setSelectedAppointment(null)}
                disabled={actionLoading}
                fullWidth
              >
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={manualDialogOpen}
        onClose={() => !manualLoading && setManualDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2, m: { xs: 1.5, sm: 3 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Novo agendamento
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            Cliente sem conta
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome do cliente"
              value={manualForm.customerName}
              onChange={(event) => setManualForm((form) => ({ ...form, customerName: onlyLettersAndSpaces(event.target.value) }))}
              onBlur={() => setManualForm((form) => ({ ...form, customerName: normalizeCustomerName(form.customerName) }))}
              fullWidth
              autoFocus
              inputProps={{ inputMode: "text" }}
            />
            <TextField
              label="WhatsApp"
              value={manualForm.customerWhatsapp}
              onChange={(event) => setManualForm((form) => ({ ...form, customerWhatsapp: formatWhatsapp(event.target.value) }))}
              placeholder="(11) 91234-5678"
              fullWidth
              inputProps={{ inputMode: "tel" }}
            />
            <TextField
              select
              label="Serviço"
              value={manualForm.serviceId}
              onChange={(event) => setManualForm((form) => ({ ...form, serviceId: event.target.value }))}
              fullWidth
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.nome} · {formatCurrency(Number(service.preço) || 0)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Horário disponível"
              value={manualForm.timeId}
              onChange={(event) => setManualForm((form) => ({ ...form, timeId: event.target.value }))}
              fullWidth
              helperText={timeSlots.length === 0 ? "Crie horários disponíveis antes de agendar." : undefined}
            >
              {timeSlots.map((slot) => (
                <MenuItem key={slot.id} value={slot.id}>
                  {formatSlotLabel(slot)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleManualSubmit}
            disabled={manualLoading || timeSlots.length === 0}
            fullWidth
          >
            {manualLoading ? "Criando..." : "Criar agendamento"}
          </Button>
          <Button
            variant="text"
            onClick={() => setManualDialogOpen(false)}
            disabled={manualLoading}
            fullWidth
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => !actionLoading && setCancelDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Cancelar agendamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>
            Não
          </Button>
          <Button onClick={handleCancel} color="error" disabled={actionLoading} autoFocus>
            Sim, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
