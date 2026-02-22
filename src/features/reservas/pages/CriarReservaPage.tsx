import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBarbers,
  getServices,
  getTimesByBarber,
  criarReserva,
} from "../../../api/reservas/reserva.service";
import type { Barber, Service, TimeSlot } from "../../../api/reservas/types";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
  Alert,
  Paper,
  MobileStepper,
  useTheme
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SelectBarber from "../components/SelectBarber";
import SelectService from "../components/SelectService";
import CalendarTimePicker from "../components/SelectCalendarTimePicker";
import ErrorAlert from "../../../components/ErrorAlert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PersonIcon from "@mui/icons-material/Person";
import ScheduleIcon from "@mui/icons-material/Schedule";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

const reservaSchema = z.object({
  barberId: z.string().min(1, "Selecione um barbeiro"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  timeId: z.string().min(1, "Selecione um horário"),
});

type ReservaForm = z.infer<typeof reservaSchema>;

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
  const [currentBarberId, setCurrentBarberId] = useState<string>("");
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const hasFetched = useRef(false);

  const {
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
    trigger
  } = useForm<ReservaForm>({
    resolver: zodResolver(reservaSchema),
    defaultValues: { barberId: "", serviceId: "", timeId: "" },
  });

  const selectedBarberId = watch("barberId");
  
  useEffect(() => {
    if (selectedBarberId) {
      setCurrentBarberId(selectedBarberId);
    }
  }, [selectedBarberId]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadInitialData();
  }, []);

  useEffect(() => {
    setValue("timeId", "");
    if (currentBarberId) {
      loadTimes(currentBarberId);
    } else {
      setTimes([]);
    }
  }, [currentBarberId, setValue]);

  const handleNext = async () => {
    let fieldToCheck = "";
    if (activeStep === 0) fieldToCheck = "barberId";
    else if (activeStep === 1) fieldToCheck = "serviceId";

    const isValid = await trigger(fieldToCheck as keyof ReservaForm);
    if (isValid) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
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
      setSuccessMessage("Reserva criada com sucesso!");
      reset();
      setTimeout(() => navigate("/reservas"), 2000);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError("Erro ao criar reserva: " + (errorMessage || "Verifique os dados"));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Controller
            name="barberId"
            control={control}
            render={({ field }) => (
              <SelectBarber
                barbers={barbers}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  setSelectedBarber(val);
                }}
                loading={loading}
                error={errors.barberId?.message}
              />
            )}
          />
        );
      case 1:
        return (
          <Controller
            name="serviceId"
            control={control}
            render={({ field }) => (
              <SelectService
                services={services}
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  setSelectedService(val);
                }}
                loading={loading}
                error={errors.serviceId?.message}
              />
            )}
          />
        );
        case 2:
        return (
          <Controller
            name="timeId"
            control={control}
            render={({ field }) => (
              <CalendarTimePicker
                times={times}
                value={field.value}
                onChange={field.onChange}
                loading={loading}
                error={errors.timeId?.message}
              />
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 2, sm: 3 }, py: 2 }}>
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, textAlign: "center" }}>
        Nova Reserva
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
        Escolha o barbeiro, serviço e horário
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

        {error && (
          <ErrorAlert message={error} onClose={() => setError(null)} />
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
                onClick={() => {
                  const values = watch();
                  const barberId = values.barberId || selectedBarber;
                  const serviceId = values.serviceId || selectedService;
                  const timeId = values.timeId;

                  if (!barberId || !serviceId || !timeId) {
                    setError("Selecione o barbeiro, serviço e horário");
                    return;
                  }

                  setError(null);
                  onSubmit(barberId, serviceId, timeId);
                }}
                disabled={isSubmitting || loading}
                variant="contained"
              >
                {isSubmitting ? "Criando..." : "Confirmar"}
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

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
