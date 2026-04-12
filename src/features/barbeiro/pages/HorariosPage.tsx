import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Stack,
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
import type { GenerateTimeSlotsParams, TimeSlot, ValidationResult } from "../../../api/time/time.service";

dayjs.locale("pt-br");

const STORAGE_KEY = "barber_time_config";

interface TimeConfig {
  startTime: string;
  endTime: string;
  blockDuration: number;
  hasInterval: boolean;
  intervalStart: string;
  intervalDuration: number;
}

const defaultConfig: TimeConfig = {
  startTime: "08:00",
  endTime: "21:00",
  blockDuration: 30,
  hasInterval: false,
  intervalStart: "12:00",
  intervalDuration: 60,
};

const blockDurationOptions = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1h30min" },
  { value: 120, label: "2 horas" },
];

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
  return dayjs(slot.date).format("HH:mm");
}

export default function HorariosPage() {
  const [config, setConfig] = useState<TimeConfig>(defaultConfig);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warningDialog, setWarningDialog] = useState<ValidationResult | null>(null);
  const [pendingParams, setPendingParams] = useState<GenerateTimeSlotsParams | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDayAnchor, setSelectedDayAnchor] = useState<{ el: HTMLElement | null; date: string } | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, loading: false });
  const [selectedWarningOption, setSelectedWarningOption] = useState("0");
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
      days.add(dayjs(slot.date).format("YYYY-MM-DD"));
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
      .filter((slot) => dayjs(slot.date).format("YYYY-MM-DD") === dateStr)
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

  const upcomingSlots = useMemo(
    () => timeSlots.filter((slot) => dayjs(slot.date).isAfter(dayjs())).length,
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

    const sortedDays = [...selectedDays].sort();
    const startDate = sortedDays[0];
    const endDate = sortedDays[sortedDays.length - 1];

    const params: GenerateTimeSlotsParams = {
      startTime: config.startTime,
      endTime: config.endTime,
      blockDuration: config.blockDuration,
      startDate,
      endDate,
    };

    if (config.hasInterval) {
      params.intervalStart = config.intervalStart;
      params.intervalDuration = config.intervalDuration;
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

      if (response.validation.warning && !pendingParams) {
        setWarningDialog(response.validation);
        setPendingParams(params);
        setSelectedWarningOption("0");
        return;
      }

      if (response.validation.isValid) {
        setSuccess(`Gerados ${response.timeSlots.length} horários com sucesso!`);
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

  const handleWarningConfirm = async (optionIndex: number) => {
    if (!pendingParams || !warningDialog) return;

    const selectedOption = warningDialog.warning?.options[optionIndex];
    if (!selectedOption) return;

    try {
      setLoading(true);
      setWarningDialog(null);

      const response = await generateTimeSlots({
        ...pendingParams,
        selectedOption,
      });

      if (response.validation.isValid) {
        setSuccess(`Gerados ${response.timeSlots.length} horários com sucesso!`);
        setSelectedDays([]);
        await loadTimeSlots();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar horários";
      setError(message);
    } finally {
      setLoading(false);
      setPendingParams(null);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedSlots((slots) => (slots.includes(id) ? slots.filter((slot) => slot !== id) : [...slots, id]));
  };

  const handleSelectAll = () => {
    if (!selectedDayAnchor) return;
    const daySlots = getSlotsForDay(selectedDayAnchor.date).map((slot) => slot.id);
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

      {selectedDayAnchor && getSlotsForDay(selectedDayAnchor.date).length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
          Nenhum horário disponível
        </Typography>
      ) : (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, mb: 2 }}>
            {selectedDayAnchor &&
              getSlotsForDay(selectedDayAnchor.date).map((slot) => {
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
                  </Paper>
                );
              })}
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button size="small" onClick={handleSelectAll} disabled={!selectedDayAnchor}>
              {selectedDayAnchor && selectedSlots.length === getSlotsForDay(selectedDayAnchor.date).length
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
          Crie blocos de atendimento e acompanhe os dias disponíveis.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 1,
          mb: 2,
        }}
      >
        {[
          { label: "Horários futuros", value: upcomingSlots, icon: <AccessTimeIcon fontSize="small" /> },
          { label: "Dias ativos", value: daysWithSlots.size, icon: <EventAvailableIcon fontSize="small" /> },
          { label: "Bloco", value: `${config.blockDuration} min`, icon: <CalendarMonthIcon fontSize="small" /> },
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
              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  select
                  label="Duração do atendimento"
                  value={config.blockDuration}
                  onChange={(event) => saveConfig({ ...config, blockDuration: Number(event.target.value) })}
                  fullWidth
                  size="small"
                >
                  {blockDurationOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
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
              Criar horários
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
              {loading ? "Gerando..." : "Gerar horários"}
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
                Horários criados
              </Typography>
              <Typography variant="subtitle1" fontWeight={800}>
                Calendário disponível
              </Typography>
            </Box>
            <Chip label={`${upcomingSlots} horários`} size="small" variant="outlined" />
          </Box>

          {loadingSlots ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
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
                Nenhum horário cadastrado
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
                    setSelectedDayAnchor({ el: null, date: dateStr });
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

      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={!!selectedDayAnchor}
          onClose={closeSelectedDay}
          PaperProps={{
            sx: {
              bgcolor: "background.paper",
              borderRadius: "8px 8px 0 0",
            },
          }}
        >
          {slotManager}
        </Drawer>
      ) : (
        <Popover
          open={!!selectedDayAnchor}
          anchorEl={selectedDayAnchor?.el}
          onClose={closeSelectedDay}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          PaperProps={{ sx: { bgcolor: "background.paper", minWidth: 340, borderRadius: 2 } }}
        >
          {slotManager}
        </Popover>
      )}

      <Dialog
        open={!!warningDialog}
        onClose={() => setWarningDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: 2 } }}
      >
        <DialogTitle>Atenção</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {warningDialog?.warning?.message}
          </Alert>
          <FormControl>
            <FormLabel>Escolha uma opção:</FormLabel>
            <RadioGroup
              value={selectedWarningOption}
              onChange={(event) => setSelectedWarningOption(event.target.value)}
            >
              {warningDialog?.warning?.options.map((option, index) => (
                <FormControlLabel
                  key={`${option.start}-${option.end}`}
                  value={index.toString()}
                  control={<Radio />}
                  label={`${option.start} - ${option.end}`}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningDialog(null)}>Cancelar</Button>
          <Button variant="contained" onClick={() => handleWarningConfirm(Number(selectedWarningOption))}>
            Confirmar
          </Button>
        </DialogActions>
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
