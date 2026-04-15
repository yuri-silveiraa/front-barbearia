import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  criarReserva,
  getBarbers,
  getServices,
  getTimesByBarber,
} from "../../../api/reservas/reserva.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { useAuth } from "../../../contexts/AuthContext";
import CalendarTimePicker from "../components/SelectCalendarTimePicker";
import SelectBarber from "../components/SelectBarber";
import SelectService from "../components/SelectService";
import type { Barber, Service, TimeSlot } from "../../../api/reservas/types";

const steps = [
  { label: "Barbeiro", icon: <PersonIcon fontSize="small" /> },
  { label: "Serviço", icon: <ContentCutIcon fontSize="small" /> },
  { label: "Horário", icon: <ScheduleIcon fontSize="small" /> },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatSlotDate(value: string) {
  if (!value) return "Escolha o horário";

  try {
    return new Date(value).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export default function CriarReservaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [times, setTimes] = useState<TimeSlot[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedTimeId, setSelectedTimeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    barberId: "",
    serviceId: "",
    timeId: "",
  });
  const [activeStep, setActiveStep] = useState(0);
  const hasFetched = useRef(false);

  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === selectedBarberId),
    [barbers, selectedBarberId]
  );
  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId),
    [services, selectedServiceId]
  );
  const selectedTime = useMemo(
    () => times.find((time) => time.id === selectedTimeId),
    [selectedTimeId, times]
  );

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [barbersRes, servicesRes] = await Promise.all([
        getBarbers(),
        getServices(),
      ]);
      setBarbers(barbersRes || []);
      setServices(servicesRes || []);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Tente novamente";
      setError(`Erro ao carregar dados iniciais: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTimes = useCallback(async (barberId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getTimesByBarber(barberId);
      setTimes(res);
      if (res.length === 0) {
        setError("Nenhum horário disponível para este barbeiro no momento.");
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === "object" && "message" in err
        ? (err as { message: string }).message
        : "Tente novamente";
      setError(`Erro ao carregar horários: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    setSelectedTimeId("");
    setFieldErrors((prev) => ({ ...prev, timeId: "" }));

    if (selectedBarberId) {
      loadTimes(selectedBarberId);
    } else {
      setTimes([]);
    }
  }, [loadTimes, selectedBarberId]);

  const handleNext = () => {
    if (activeStep === 0 && !selectedBarberId) {
      setFieldErrors((prev) => ({ ...prev, barberId: "Selecione um barbeiro" }));
      return;
    }

    if (activeStep === 1 && !selectedServiceId) {
      setFieldErrors((prev) => ({ ...prev, serviceId: "Selecione um serviço" }));
      return;
    }

    setError(null);
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    if (!selectedBarberId || !selectedServiceId || !selectedTimeId) {
      setFieldErrors({
        barberId: selectedBarberId ? "" : "Selecione um barbeiro",
        serviceId: selectedServiceId ? "" : "Selecione um serviço",
        timeId: selectedTimeId ? "" : "Selecione um horário",
      });
      setError("Selecione o barbeiro, serviço e horário");
      return;
    }

    setSubmitting(true);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await criarReserva({
        barberId: selectedBarberId,
        clientId: user.id,
        serviceId: selectedServiceId,
        timeId: selectedTimeId,
      });
      setSuccessMessage("Agendamento criado com sucesso!");
      setSelectedBarberId("");
      setSelectedServiceId("");
      setSelectedTimeId("");
      setTimeout(() => navigate("/reservas"), 1600);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Verifique os dados";
      setError(`Erro ao criar agendamento: ${errorMessage}`);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <SelectBarber
            barbers={barbers}
            value={selectedBarberId}
            onChange={(val) => {
              setSelectedBarberId(val);
              setFieldErrors((prev) => ({ ...prev, barberId: "" }));
            }}
            loading={loading && !submitting}
            error={fieldErrors.barberId}
          />
        );
      case 1:
        return (
          <SelectService
            services={services}
            value={selectedServiceId}
            onChange={(val) => {
              setSelectedServiceId(val);
              setFieldErrors((prev) => ({ ...prev, serviceId: "" }));
            }}
            loading={loading && !submitting}
            error={fieldErrors.serviceId}
          />
        );
      case 2:
        return (
          <CalendarTimePicker
            times={times}
            value={selectedTimeId}
            onChange={(val) => {
              setSelectedTimeId(val);
              setFieldErrors((prev) => ({ ...prev, timeId: "" }));
            }}
            loading={loading && !submitting}
            error={fieldErrors.timeId}
          />
        );
      default:
        return null;
    }
  };

  const canContinue =
    (activeStep === 0 && !!selectedBarberId) ||
    (activeStep === 1 && !!selectedServiceId) ||
    (activeStep === 2 && !!selectedTimeId);

  return (
    <Box sx={{ width: "100%", maxWidth: 760, mx: "auto", pb: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError(null)} />
      <FeedbackBanner message={successMessage} severity="success" onClose={() => setSuccessMessage(null)} />

      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
          Agendamento
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
          Novo horário
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Escolha barbeiro, serviço e horário em poucos toques.
        </Typography>
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
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.25, mb: 1.5 }}>
          {steps.map((step, index) => {
            const selected = index === activeStep;
            const completed = index < activeStep;

            return (
              <Box
                key={step.label}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: selected || completed ? "primary.main" : "text.secondary",
                }}
              >
                {completed ? <CheckCircleIcon fontSize="small" /> : step.icon}
                <Typography variant="caption" fontWeight={selected ? 800 : 600} noWrap>
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <LinearProgress
          variant="determinate"
          value={((activeStep + 1) / steps.length) * 100}
          sx={{ height: 6, borderRadius: 2, bgcolor: "action.hover" }}
        />
      </Paper>

      <Box sx={{ mb: 2 }}>{renderStepContent()}</Box>

      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          bottom: { xs: 74, md: 16 },
          zIndex: 2,
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          border: "1px solid",
          borderColor: "rgba(37, 208, 179, 0.45)",
          bgcolor: "background.paper",
          boxShadow: "0 14px 36px rgba(0, 0, 0, 0.28)",
        }}
      >
        <Stack spacing={1.25}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Resumo
              </Typography>
              <Typography fontWeight={800} noWrap>
                {selectedService?.name ?? "Escolha um serviço"}
              </Typography>
            </Box>
            {selectedService && (
              <Chip
                label={currencyFormatter.format(selectedService.price)}
                color="primary"
                size="small"
                sx={{ fontWeight: 800 }}
              />
            )}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {selectedBarber?.name ?? "Escolha o barbeiro"}
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="right" noWrap>
              {formatSlotDate(selectedTime?.date ?? selectedTime?.data ?? "")}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading || submitting}
              fullWidth
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={loading || submitting || !canContinue}
              fullWidth
            >
              {activeStep === steps.length - 1
                ? submitting ? "Criando..." : "Confirmar"
                : "Continuar"}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
