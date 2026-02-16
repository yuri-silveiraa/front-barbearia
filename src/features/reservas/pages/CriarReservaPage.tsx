import { useEffect, useState } from "react";
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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SelectBarber from "../components/SelectBarber";
import SelectService from "../components/SelectService";
import CalendarTimePicker from "../components/SelectCalendarTimePicker";
import ErrorAlert from "../../../components/ErrorAlert";

const reservaSchema = z.object({
  barberId: z.string().min(1, "Selecione um barbeiro"),
  serviceId: z.string().min(1, "Selecione um serviço"),
  timeId: z.string().min(1, "Selecione um horário"),
});

type ReservaForm = z.infer<typeof reservaSchema>;

export default function CriarReservaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [times, setTimes] = useState<TimeSlot[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ReservaForm>({
    resolver: zodResolver(reservaSchema),
    defaultValues: { barberId: "", serviceId: "", timeId: "" },
  });

  const selectedBarberId = watch("barberId");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedBarberId) {
      loadTimes(selectedBarberId);
    } else {
      setTimes([]); 
    }
  }, [selectedBarberId]);

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
      setTimes(res || []);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err as { message: string }).message 
        : "Tente novamente";
      setError("Erro ao carregar horários: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReservaForm) => {
    if (!user?.id) {
      setError("Usuário não autenticado. Faça login novamente.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await criarReserva({
        barberId: data.barberId,
        clientId: user.id,
        serviceId: data.serviceId,
        timeId: data.timeId,
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

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h5" mb={3} textAlign="center">
        Criar Nova Reserva
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <ErrorAlert message={error} onClose={() => setError(null)} />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* BARBEIRO */}
        <Controller
          name="barberId"
          control={control}
          render={({ field }) => (
            <SelectBarber
              barbers={barbers}
              value={field.value}
              onChange={field.onChange}
              loading={loading}
              error={errors.barberId?.message}
            />
          )}
        />

        {/* SERVIÇO */}
        <Controller
          name="serviceId"
          control={control}
          render={({ field }) => (
            <SelectService
              services={services}
              value={field.value}
              onChange={field.onChange}
              loading={loading}
              error={errors.serviceId?.message}
            />
          )}
        />

        {/* CALENDÁRIO E HORÁRIOS */}
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
              selectedBarberId={selectedBarberId}
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isSubmitting || loading}
        >
          {isSubmitting ? "Criando..." : "Criar Reserva"}
        </Button>
      </form>

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