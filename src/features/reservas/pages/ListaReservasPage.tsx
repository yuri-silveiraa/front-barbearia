import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { cancelarReserva, getReservas } from "../../../api/reservas/reserva.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { AppointmentListSkeleton, HighlightSkeleton, MetricsSkeleton } from "../../../components/skeletons/AppSkeletons";
import type { Reserva, ReservaStatus } from "../types";
import { buildWhatsappUrl, formatWhatsappDisplay } from "../../../utils/customerInput";

interface StatusConfig {
  color: "primary" | "success" | "error";
  label: string;
}

const statusConfig: Record<ReservaStatus, StatusConfig> = {
  SCHEDULED: { color: "primary", label: "Agendada" },
  COMPLETED: { color: "success", label: "Atendida" },
  CANCELED: { color: "error", label: "Cancelada" },
};

function isFutureScheduled(reserva: Reserva) {
  return reserva.status === "SCHEDULED" && new Date(reserva.time).getTime() >= Date.now();
}

export function ListaReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  async function carregar() {
    try {
      setLoading(true);
      const response = await getReservas();
      setReservas(response);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar reservas";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    carregar();
  }, []);

  const counts = useMemo(
    () => ({
      next: reservas.filter(isFutureScheduled).length,
      completed: reservas.filter((reserva) => reserva.status === "COMPLETED").length,
      canceled: reservas.filter((reserva) => reserva.status === "CANCELED").length,
    }),
    [reservas]
  );

  const nextReserva = useMemo(
    () =>
      reservas
        .filter(isFutureScheduled)
        .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0] ?? null,
    [reservas]
  );

  const orderedReservas = useMemo(() => {
    const upcoming = reservas
      .filter(isFutureScheduled)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const history = reservas
      .filter((reserva) => !isFutureScheduled(reserva))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return [...upcoming, ...history];
  }, [reservas]);

  const formatReservaDate = (value: string) =>
    new Date(value).toLocaleString("pt-BR", {
      weekday: isMobile ? "short" : "long",
      day: "numeric",
      month: isMobile ? "2-digit" : "long",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatReservaDay = (value: string) =>
    new Date(value).toLocaleDateString("pt-BR", {
      weekday: isMobile ? "short" : "long",
      day: "numeric",
      month: isMobile ? "2-digit" : "long",
      year: "numeric",
    });

  const formatReservaTime = (value: string) =>
    new Date(value).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });


  const selectedWhatsappUrl = selectedReserva ? buildWhatsappUrl(selectedReserva.barberTelephone) : null;
  const selectedWhatsappLabel = selectedReserva?.barberTelephone
    ? formatWhatsappDisplay(selectedReserva.barberTelephone)
    : "WhatsApp não informado";

  const handleCancel = async () => {
    if (!selectedReserva) return;

    setCanceling(true);
    setError(null);
    setSuccess(null);

    try {
      await cancelarReserva(selectedReserva.id);
      setSuccess("Agendamento cancelado com sucesso.");
      setSelectedReserva(null);
      await carregar();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao cancelar agendamento";
      setError(message);
    } finally {
      setCanceling(false);
      setCancelDialogOpen(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 760, mx: "auto", pb: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError(null)} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess(null)} />

      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
          Reservas
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
          Meus agendamentos
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Acompanhe seus horários na barbearia.
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate("/reservas/create")}
            sx={{ flexShrink: 0 }}
          >
            Novo
          </Button>
        </Box>
      </Box>

      {loading && reservas.length === 0 ? (
        <MetricsSkeleton />
      ) : (
        <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          mb: 2,
        }}
      >
        {[
          { label: "Próximos", value: counts.next, icon: <ScheduleIcon fontSize="small" /> },
          { label: "Atendidos", value: counts.completed, icon: <ContentCutIcon fontSize="small" /> },
          { label: "Cancelados", value: counts.canceled, icon: <CalendarMonthIcon fontSize="small" /> },
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
      )}

      {loading && reservas.length === 0 ? (
        <>
          <HighlightSkeleton />
          <AppointmentListSkeleton />
        </>
      ) : (
        <>
          {nextReserva && (
            <Paper
          elevation={0}
          onClick={() => setSelectedReserva(nextReserva)}
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
            Próximo agendamento
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 0.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" fontWeight={800}>
                {nextReserva.service}
              </Typography>
              <Typography fontWeight={700} noWrap>
                {nextReserva.barber}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {formatReservaDate(nextReserva.time)}
              </Typography>
            </Box>
            <ArrowForwardIcon color="primary" sx={{ alignSelf: "center", flexShrink: 0 }} />
          </Box>
            </Paper>
          )}

          {orderedReservas.length === 0 ? (
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
          <ScheduleIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum agendamento ainda
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Marque seu primeiro atendimento na barbearia.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/reservas/create")}>
            Criar agendamento
          </Button>
            </Paper>
          ) : (
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
              Lista
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              Todos os agendamentos
            </Typography>
          </Box>

          <Stack divider={<Divider flexItem />}>
            {orderedReservas.map((reserva) => {
              const config = statusConfig[reserva.status];

              return (
                <Box
                  key={reserva.id}
                  component="button"
                  onClick={() => setSelectedReserva(reserva)}
                  sx={{
                    width: "100%",
                    border: 0,
                    bgcolor: "transparent",
                    color: "inherit",
                    textAlign: "left",
                    p: { xs: 2, sm: 2.5 },
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    gap: 1.5,
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={800} noWrap>
                      {reserva.service}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75 }}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {reserva.barber}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatReservaDate(reserva.time)}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={1} alignItems="flex-end">
                    <Chip
                      label={config.label}
                      color={config.color}
                      size="small"
                      variant={reserva.status === "SCHEDULED" ? "filled" : "outlined"}
                      sx={{ fontWeight: 700 }}
                    />
                    <ArrowForwardIcon color="primary" fontSize="small" />
                  </Stack>
                </Box>
              );
            })}
          </Stack>
            </Paper>
          )}
        </>
      )}

      <Dialog
        open={!!selectedReserva}
        onClose={() => !canceling && setSelectedReserva(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 2,
            m: { xs: 1.5, sm: 3 },
          },
        }}
      >
        {selectedReserva && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                    Agendamento
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {selectedReserva.service}
                  </Typography>
                </Box>
                <Chip
                  label={statusConfig[selectedReserva.status].label}
                  color={statusConfig[selectedReserva.status].color}
                  size="small"
                  sx={{ fontWeight: 700, mt: 0.5 }}
                />
              </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
              <Stack spacing={2} divider={<Divider flexItem />}>
                <Box sx={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: 1.5 }}>
                  <CalendarMonthIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Dia e horário
                    </Typography>
                    <Typography fontWeight={800}>{formatReservaTime(selectedReserva.time)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatReservaDay(selectedReserva.time)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: 1.5 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Barbeiro
                    </Typography>
                    <Typography fontWeight={800}>{selectedReserva.barber}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedWhatsappLabel}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", gap: 1.5 }}>
                  <ContentCutIcon color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Serviço
                    </Typography>
                    <Typography fontWeight={800}>{selectedReserva.service}</Typography>
                  </Box>
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
              {selectedWhatsappUrl && (
                <Button
                  variant="contained"
                  color="success"
                  href={selectedWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<WhatsAppIcon />}
                  fullWidth
                >
                  Chamar barbeiro
                </Button>
              )}
              {selectedReserva.status === "SCHEDULED" && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelDialogOpen(true)}
                  disabled={canceling}
                  fullWidth
                >
                  Cancelar
                </Button>
              )}
              <Button
                variant={selectedReserva.status === "SCHEDULED" || selectedWhatsappUrl ? "text" : "contained"}
                onClick={() => setSelectedReserva(null)}
                disabled={canceling}
                fullWidth
              >
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={cancelDialogOpen}
        onClose={() => !canceling && setCancelDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Cancelar agendamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja cancelar o agendamento de{" "}
            <strong>{selectedReserva?.service}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={canceling}>
            Voltar
          </Button>
          <Button onClick={handleCancel} color="error" disabled={canceling} autoFocus>
            {canceling ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
