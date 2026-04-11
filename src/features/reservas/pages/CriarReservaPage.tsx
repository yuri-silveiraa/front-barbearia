import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  MobileStepper,
  useTheme
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import {
  getBarbers,
  getServices,
  getTimesByBarber,
  criarReserva,
} from "../../../api/reservas/reserva.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { useAuth } from "../../../contexts/AuthContext";
import CalendarTimePicker from "../components/SelectCalendarTimePicker";
import SelectBarber from "../components/SelectBarber";
import SelectService from "../components/SelectService";
import type { Barber, Service, TimeSlot } from "../../../api/reservas/types";

const steps = [
  { label: "Barbeiro", icon: <PersonIcon /> },
  { label: "Serviço", icon: <ContentCutIcon /> },
  { label: "Horário", icon: <ScheduleIcon /> }
];

export default function CriarReservaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

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

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadInitialData();
  }, []);

  useEffect(() => {
    setSelectedTimeId("");
    setFieldErrors((prev) => ({ ...prev, timeId: "" }));

    if (selectedBarberId) {
      loadTimes(selectedBarberId);
    } else {
      setTimes([]);
    }
  }, [selectedBarberId]);

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
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const loadInitialData = async () => {
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
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err as { message: string }).message 
        : "Tente novamente";
      setError("Erro ao carregar dados iniciais: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadTimes = async (barberId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTimesByBarber(barberId);
      setTimes(res);
      if (res.length === 0) {
        setError("Nenhum horário disponível para este barbeiro no momento.");
      }
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err as { message: string }).message 
        : "Tente novamente";
      setError("Erro ao carregar horários: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (barberId: string, serviceId: string, timeId: string) => {
    if (!user?.id) {
      setError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await criarReserva({
        barberId,
        clientId: user.id,
        serviceId,
        timeId,
      });
      setSuccessMessage("Agendamento criado com sucesso!");
      setSelectedBarberId("");
      setSelectedServiceId("");
      setSelectedTimeId("");
      setTimeout(() => navigate("/reservas"), 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Verifique os dados";
      setError("Erro ao criar agendamento: " + errorMessage);
    } finally {
      setLoading(false);
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
            loading={loading}
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
            loading={loading}
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
            loading={loading}
            error={fieldErrors.timeId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 2, sm: 3 }, py: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError(null)} />
      <FeedbackBanner message={successMessage} severity="success" onClose={() => setSuccessMessage(null)} />
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, textAlign: "center" }}>
        Novo agendamento
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
        Faça seu agendamento escolhendo barbeiro, serviço e horário
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 3, sm: 4 }, mb: 3 }}>
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            
            return (
              <Box
                key={step.label}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <Box
                  sx={{
                    width: isActive ? 48 : 36,
                    height: isActive ? 48 : 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: isCompleted 
                      ? "success.main" 
                      : isActive 
                        ? "primary.main" 
                        : "action.disabled",
                    color: "white",
                    transition: "all 0.3s ease"
                  }}
                >
                  {isCompleted ? <CheckCircleIcon sx={{ fontSize: isActive ? 28 : 20 }} /> : step.icon}
                </Box>
              </Box>
            );
          })}
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        )}

        <Box sx={{ minHeight: 100 }}>
          {renderStepContent()}
        </Box>

        <MobileStepper
          variant="text"
          steps={steps.length}
          position="static"
          activeStep={activeStep}
          sx={{ 
            mt: 2, 
            backgroundColor: "transparent",
            "& .MuiMobileStepper-dotActive": {
              bgcolor: "primary.main"
            }
          }}
          nextButton={
            activeStep < steps.length - 1 ? (
              <Button
                size="small"
                onClick={handleNext}
                disabled={loading}
                variant="contained"
              >
                Próximo
                {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
              </Button>
            ) : (
              <Button
                size="small"
                onClick={async () => {
                  if (!selectedBarberId || !selectedServiceId || !selectedTimeId) {
                    setFieldErrors({
                      barberId: selectedBarberId ? "" : "Selecione um barbeiro",
                      serviceId: selectedServiceId ? "" : "Selecione um serviço",
                      timeId: selectedTimeId ? "" : "Selecione um horário",
                    });
                    setError("Selecione o barbeiro, serviço e horário");
                    return;
                  }

                  setError(null);
                  try {
                    setSubmitting(true);
                    await onSubmit(selectedBarberId, selectedServiceId, selectedTimeId);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting || loading}
                variant="contained"
              >
                {submitting ? "Criando..." : "Confirmar"}
              </Button>
            )
          }
          backButton={
            activeStep > 0 ? (
              <Button
                size="small"
                onClick={handleBack}
                disabled={loading}
              >
                {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                Voltar
              </Button>
            ) : (
              <Box sx={{ width: 56 }} />
            )
          }
        />
      </Paper>
    </Box>
  );
}
