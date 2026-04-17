import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickersDay } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import type { PickersDayProps } from "@mui/x-date-pickers";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import {
  deleteTimeSlot,
  generateTimeSlots,
  getMyTimeSlots,
} from "../../../api/time/time.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { MetricsSkeleton } from "../../../components/skeletons/AppSkeletons";
import type { TimeSlot } from "../../../api/time/time.service";
import { buildGenerateTimeSlotsParams } from "../utils/timeSlotGeneration";

dayjs.locale("pt-br");

const STORAGE_KEY = "barber_time_config";

interface TimeConfig {
  startTime: string;
  endTime: string;
  hasInterval: boolean;
  intervalStart: string;
  intervalDuration: number;
}

const defaultConfig: TimeConfig = {
  startTime: "08:00",
  endTime: "21:00",
  hasInterval: false,
  intervalStart: "12:00",
  intervalDuration: 60,
};

function TimeSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (time: string) => void;
  label: string;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <TimePicker
        label={label}
        value={dayjs(value, "HH:mm")}
        onChange={(val) => {
          if (val) {
            onChange(val.format("HH:mm"));
          }
        }}
        ampm={false}
        minutesStep={5}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
}

function formatDateLabel(date: string) {
  return dayjs(date).format("ddd, DD/MM/YYYY");
}

function formatSlotTime(slot: TimeSlot) {
  return dayjs(slot.startAt).format("HH:mm");
}

function formatSlotRange(slot: TimeSlot) {
  return `${dayjs(slot.startAt).format("HH:mm")} - ${dayjs(slot.endAt).format("HH:mm")}`;
}

function formatBreakRange(slots: TimeSlot[]) {
  const slotWithBreak = slots.find((slot) => slot.breakStartAt && slot.breakEndAt);
  if (!slotWithBreak?.breakStartAt || !slotWithBreak.breakEndAt) return null;

  return `${dayjs(slotWithBreak.breakStartAt).format("HH:mm")} - ${dayjs(slotWithBreak.breakEndAt).format("HH:mm")}`;
}

export default function HorariosPage() {
  const [config, setConfig] = useState<TimeConfig>(defaultConfig);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDayAnchor, setSelectedDayAnchor] = useState<{ date: string } | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, loading: false });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch {
        setConfig(defaultConfig);
      }
    }
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoadingSlots(true);
      const slots = await getMyTimeSlots();
      setTimeSlots(slots);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar horários";
      setError(message);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const saveConfig = (newConfig: TimeConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const handleCalendarChange = (date: Dayjs | null) => {
    if (!date) return;
    const dateStr = date.format("YYYY-MM-DD");

    setSelectedDays((days) =>
      days.includes(dateStr) ? days.filter((item) => item !== dateStr) : [...days, dateStr]
    );
  };

  const shouldDisableDate = (date: Dayjs) => date.isBefore(dayjs(), "day");

  const GenerateDay = (props: PickersDayProps) => {
    const dateStr = props.day.format("YYYY-MM-DD");
    const isSelected = selectedDays.includes(dateStr);

    return (
      <PickersDay
        {...props}
        sx={{
          borderRadius: 2,
          bgcolor: isSelected ? "primary.main" : "transparent",
          color: isSelected ? "primary.contrastText" : "text.primary",
          fontWeight: isSelected ? 800 : 500,
          "&:hover": {
            bgcolor: isSelected ? "primary.dark" : "action.hover",
          },
        }}
      />
    );
  };

  const daysWithSlots = useMemo(() => {
    const days = new Set<string>();
    timeSlots.forEach((slot) => {
      days.add(dayjs(slot.startAt).format("YYYY-MM-DD"));
    });
    return days;
  }, [timeSlots]);

  const ViewDay = (props: PickersDayProps) => {
    const dateStr = props.day.format("YYYY-MM-DD");
    const hasSlots = daysWithSlots.has(dateStr);

    return (
      <PickersDay
        {...props}
        sx={{
          borderRadius: 2,
          bgcolor: hasSlots ? "rgba(0, 191, 165, 0.12)" : "transparent",
          color: hasSlots ? "primary.main" : "text.disabled",
          fontWeight: hasSlots ? 800 : 500,
          border: hasSlots ? "1px solid rgba(0, 191, 165, 0.35)" : "1px solid transparent",
        }}
      />
    );
  };

  const getSlotsForDay = (dateStr: string) =>
    timeSlots
      .filter((slot) => dayjs(slot.startAt).format("YYYY-MM-DD") === dateStr)
      .sort((a, b) => dayjs(a.startAt).unix() - dayjs(b.startAt).unix());

  const selectedDaySlots = useMemo(
    () => (selectedDayAnchor ? getSlotsForDay(selectedDayAnchor.date) : []),
    [selectedDayAnchor, timeSlots]
  );
  const selectedDayBreakRange = useMemo(() => formatBreakRange(selectedDaySlots), [selectedDaySlots]);

  const upcomingSlots = useMemo(
    () => timeSlots.filter((slot) => dayjs(slot.endAt).isAfter(dayjs())).length,
    [timeSlots]
  );
  const nextWorkDay = useMemo(
    () => Array.from(daysWithSlots).sort((a, b) => (a > b ? 1 : -1))[0] ?? null,
    [daysWithSlots]
  );
  const selectedPeriodLabel =
    selectedDays.length > 0
      ? `${selectedDays.length} ${selectedDays.length === 1 ? "dia selecionado" : "dias selecionados"}`
      : "Nenhum dia selecionado";

  const handleGenerate = async () => {
    if (selectedDays.length === 0) {
      setError("Selecione pelo menos um dia");
      return;
    }

    const params = buildGenerateTimeSlotsParams(config, selectedDays);
    if (!params) {
      setError("Selecione pelo menos um dia");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await generateTimeSlots(params);

      if (!response.validation.isValid && response.validation.error) {
        setError(response.validation.error);
        return;
      }

      if (response.validation.isValid) {
        setSuccess(`Criadas ${response.timeSlots.length} jornadas com sucesso!`);
        setSelectedDays([]);
        await loadTimeSlots();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar horários";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedSlots((slots) => (slots.includes(id) ? slots.filter((slot) => slot !== id) : [...slots, id]));
  };

  const handleSelectAll = () => {
    if (!selectedDayAnchor) return;
    const daySlots = selectedDaySlots.map((slot) => slot.id);
    setSelectedSlots((slots) => (slots.length === daySlots.length ? [] : daySlots));
  };

  const handleDeleteSelected = async () => {
    try {
      setDeleteDialog({ ...deleteDialog, loading: true });
      for (const id of selectedSlots) {
        await deleteTimeSlot(id);
      }
      setSelectedSlots([]);
      setDeleteDialog({ open: false, loading: false });
      await loadTimeSlots();
      setSuccess("Horários excluídos com sucesso!");
    } catch (err: unknown) {
      setDeleteDialog({ open: false, loading: false });
      const message = err instanceof Error ? err.message : "Erro ao excluir horários";
      setError(message);
    }
  };

  const closeSelectedDay = () => {
    setSelectedDayAnchor(null);
    setSelectedSlots([]);
  };

  const slotManager = (
    <Box sx={{ p: 2, maxHeight: isMobile ? "68vh" : 420, overflow: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Horários do dia
          </Typography>
          <Typography variant="subtitle1" fontWeight={800}>
            {selectedDayAnchor?.date ? formatDateLabel(selectedDayAnchor.date) : ""}
          </Typography>
        </Box>
        <IconButton size="small" onClick={closeSelectedDay}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {selectedDayBreakRange && (
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            mb: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "rgba(255, 152, 0, 0.28)",
            bgcolor: "rgba(255, 152, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <RestaurantIcon color="warning" fontSize="small" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Intervalo
            </Typography>
            <Typography fontWeight={800}>{selectedDayBreakRange}</Typography>
          </Box>
        </Paper>
      )}

      {selectedDayAnchor && selectedDaySlots.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
          Nenhum horário disponível
        </Typography>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, mb: 2 }}>
            {selectedDaySlots.map((slot) => {
                const checked = selectedSlots.includes(slot.id);
                return (
                  <Paper
                    key={slot.id}
                    component="button"
                    type="button"
                    elevation={0}
                    onClick={() => handleCheckboxChange(slot.id)}
                    sx={{
                      p: 1,
                      minHeight: 44,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: checked ? "error.main" : "divider",
                      bgcolor: checked ? "rgba(244, 67, 54, 0.12)" : "background.default",
                      color: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <Typography fontWeight={800}>{formatSlotTime(slot)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatSlotRange(slot)}
                    </Typography>
                  </Paper>
                );
              })}
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button size="small" onClick={handleSelectAll} disabled={!selectedDayAnchor}>
              {selectedDayAnchor && selectedSlots.length === selectedDaySlots.length
                ? "Desmarcar todos"
                : "Selecionar todos"}
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => setDeleteDialog({ open: true, loading: false })}
              disabled={selectedSlots.length === 0}
              startIcon={<DeleteIcon />}
            >
              Excluir ({selectedSlots.length})
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 980, mx: "auto", pb: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess("")} />

      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
          Horários
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
          Gerenciar agenda
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Crie jornadas de atendimento e acompanhe os dias disponíveis.
        </Typography>
      </Box>

      {loadingSlots ? (
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
          { label: "Jornadas futuras", value: upcomingSlots, icon: <AccessTimeIcon fontSize="small" /> },
          { label: "Dias ativos", value: daysWithSlots.size, icon: <EventAvailableIcon fontSize="small" /> },
          { label: "Intervalo", value: config.hasInterval ? `${config.intervalDuration} min` : "Sem", icon: <RestaurantIcon fontSize="small" /> },
          { label: "Próximo dia", value: nextWorkDay ? dayjs(nextWorkDay).format("DD/MM") : "--", icon: <CalendarMonthIcon fontSize="small" /> },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: { xs: 1.25, sm: 1.75 },
              minHeight: 92,
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
              <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.92fr 1.08fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
              Configuração
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
              Jornada de trabalho
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.25 }}>
              <TimeSelect
                label="Início"
                value={config.startTime}
                onChange={(time) => saveConfig({ ...config, startTime: time })}
              />
              <TimeSelect
                label="Fim"
                value={config.endTime}
                onChange={(time) => saveConfig({ ...config, endTime: time })}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={config.hasInterval}
                  onChange={(event) => saveConfig({ ...config, hasInterval: event.target.checked })}
                  size="small"
                />
              }
              label="Ativar intervalo"
              sx={{ mt: 1.25 }}
            />

            {config.hasInterval && (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.25, mt: 1 }}>
                <TimeSelect
                  label="Início"
                  value={config.intervalStart}
                  onChange={(time) => saveConfig({ ...config, intervalStart: time, hasInterval: true })}
                />
                <TextField
                  label="Duração (min)"
                  type="number"
                  value={config.intervalDuration}
                  onChange={(event) =>
                    saveConfig({
                      ...config,
                      intervalDuration: Number(event.target.value),
                      hasInterval: true,
                    })
                  }
                  fullWidth
                  size="small"
                  inputProps={{ min: 15, max: 120 }}
                  InputProps={{ startAdornment: <RestaurantIcon color="action" sx={{ mr: 1 }} /> }}
                />
              </Box>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
              Criar jornadas
            </Typography>
            <Typography variant="subtitle1" fontWeight={800}>
              Selecione os dias
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Toque nos dias em que deseja disponibilizar essa jornada.
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <DateCalendar
                value={null}
                onChange={handleCalendarChange}
                shouldDisableDate={shouldDisableDate}
                minDate={dayjs()}
                maxDate={dayjs().add(60, "day")}
                slots={{ day: GenerateDay }}
                sx={{
                  width: "100%",
                  maxWidth: 350,
                  mx: "auto",
                  "& .MuiDayCalendar-weekDayLabel": { color: "text.secondary" },
                }}
              />
            </LocalizationProvider>

            <Box sx={{ mt: 2 }}>
              <Chip label={selectedPeriodLabel} color={selectedDays.length > 0 ? "primary" : "default"} size="small" />
            </Box>

            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={loading || selectedDays.length === 0}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccessTimeIcon />}
              fullWidth
              sx={{ mt: 2, minHeight: 44 }}
            >
              {loading ? "Gerando..." : "Criar jornadas"}
            </Button>
          </Paper>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                Jornadas criadas
              </Typography>
              <Typography variant="subtitle1" fontWeight={800}>
                Calendário disponível
              </Typography>
            </Box>
            <Chip label={`${upcomingSlots} jornadas`} size="small" variant="outlined" />
          </Box>

          {loadingSlots ? (
            <Box sx={{ py: 1 }}>
              <Skeleton width={150} height={22} sx={{ mb: 1.5 }} />
              <Skeleton variant="rounded" height={318} sx={{ borderRadius: "8px", maxWidth: 350, mx: "auto" }} />
            </Box>
          ) : daysWithSlots.size === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <CalendarMonthIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhuma jornada cadastrada
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Configure sua jornada e selecione os dias para começar.
              </Typography>
            </Paper>
          ) : (
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <DateCalendar
                value={null}
                onChange={(date) => {
                  if (!date) return;
                  const dateStr = date.format("YYYY-MM-DD");
                  if (daysWithSlots.has(dateStr)) {
                    setSelectedDayAnchor({ date: dateStr });
                  }
                }}
                minDate={dayjs()}
                shouldDisableDate={(date) => !daysWithSlots.has(date.format("YYYY-MM-DD"))}
                slots={{ day: ViewDay }}
                sx={{
                  width: "100%",
                  maxWidth: 350,
                  mx: "auto",
                  "& .MuiDayCalendar-weekDayLabel": { color: "text.secondary" },
                }}
              />
            </LocalizationProvider>
          )}
        </Paper>
      </Box>

      <Dialog
        open={!!selectedDayAnchor}
        onClose={closeSelectedDay}
        fullWidth
        maxWidth="xs"
        fullScreen={isMobile}
        PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: { xs: 0, sm: 2 } } }}
      >
        {slotManager}
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleteDialog.loading && setDeleteDialog({ open: false, loading: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: 2 } }}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir {selectedSlots.length}{" "}
            {selectedSlots.length === 1 ? "horário selecionado" : "horários selecionados"}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, loading: false })} disabled={deleteDialog.loading}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteSelected} disabled={deleteDialog.loading}>
            {deleteDialog.loading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
