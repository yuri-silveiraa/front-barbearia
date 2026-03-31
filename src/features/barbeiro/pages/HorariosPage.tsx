import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  CircularProgress,
  Popover,
  IconButton,
  TextField,
  MenuItem,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers";
import type { PickersDayProps } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloseIcon from "@mui/icons-material/Close";
import dayjs, { Dayjs } from "dayjs";
import {
  generateTimeSlots,
  getMyTimeSlots,
  deleteTimeSlot,
} from "../../../api/time/time.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import type { GenerateTimeSlotsParams, TimeSlot, ValidationResult } from "../../../api/time/time.service";

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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            sx: { width: 130 },
          },
        }}
      />
    </LocalizationProvider>
  );
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
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; loading: boolean }>({ open: false, loading: false });

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

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoadingSlots(true);
      const slots = await getMyTimeSlots();
      setTimeSlots(slots);
    } catch {
      console.error("Erro ao carregar horários");
    } finally {
      setLoadingSlots(false);
    }
  };

  const saveConfig = (newConfig: TimeConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const handleCalendarChange = (date: Dayjs | null) => {
    if (!date) return;
    
    const dateStr = date.format("YYYY-MM-DD");

    if (selectedDays.includes(dateStr)) {
      setSelectedDays(selectedDays.filter((d) => d !== dateStr));
    } else {
      setSelectedDays([...selectedDays, dateStr]);
    }
  };

  const shouldDisableDate = (date: Dayjs) => {
    return date.isBefore(dayjs(), "day");
  };

  const DayComponent = (props: PickersDayProps) => {
    const dateStr = props.day.format("YYYY-MM-DD");
    const isSelected = selectedDays.includes(dateStr);
    
    return (
      <PickersDay
        {...props}
        sx={{
          backgroundColor: isSelected ? "primary.main" : "transparent",
          color: isSelected ? "white" : "text.primary",
          "&:hover": {
            backgroundColor: isSelected ? "primary.dark" : "action.hover",
          },
        }}
      />
    );
  };

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
        return;
      }

      if (response.validation.isValid) {
        setSuccess(`Gerados ${response.timeSlots.length} horários com sucesso!`);
        setSelectedDays([]);
        await loadTimeSlots();
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Erro ao gerar horários");
      }
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
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Erro ao gerar horários");
      }
    } finally {
      setLoading(false);
      setPendingParams(null);
    }
  };

  const handleCheckboxChange = (id: string) => {
    if (selectedSlots.includes(id)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== id));
    } else {
      setSelectedSlots([...selectedSlots, id]);
    }
  };

  const handleSelectAll = () => {
    if (!selectedDayAnchor) return;
    const daySlots = getSlotsForDay(selectedDayAnchor.date).map((s) => s.id);
    if (selectedSlots.length === daySlots.length) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(daySlots);
    }
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
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message: string }).message);
      } else {
        setError("Erro ao excluir horários");
      }
    }
  };

  const daysWithSlots = useMemo(() => {
    const days = new Set<string>();
    timeSlots.forEach((slot) => {
      days.add(dayjs(slot.date).format("YYYY-MM-DD"));
    });
    return days;
  }, [timeSlots]);

  const getSlotsForDay = (dateStr: string) => {
    return timeSlots
      .filter((slot) => dayjs(slot.date).format("YYYY-MM-DD") === dateStr)
      .sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());
  };

  const handleDayClick = (event: React.MouseEvent<HTMLElement>, date: string) => {
    if (daysWithSlots.has(date)) {
      setSelectedDayAnchor({ el: event.currentTarget, date });
    }
  };

  const selectionText = selectedDays.length > 0
    ? `${selectedDays.length} dia${selectedDays.length > 1 ? "s" : ""} selecionado${selectedDays.length > 1 ? "s" : ""}`
    : "";

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", px: 2, py: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess("")} />
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, textAlign: "center" }}>
        Gerenciar Horários
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        Configure seus horários de trabalho
      </Typography>

      <Paper sx={{ p: 3, mb: 2, borderRadius: 3, backgroundColor: "background.paper" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
          Configuração de Horários
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TimeSelect
              label="Início"
              value={config.startTime}
              onChange={(time) => saveConfig({ ...config, startTime: time })}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TimeSelect
              label="Fim"
              value={config.endTime}
              onChange={(time) => saveConfig({ ...config, endTime: time })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Duração do atendimento"
              value={config.blockDuration}
              onChange={(e) => saveConfig({ ...config, blockDuration: Number(e.target.value) })}
              fullWidth
              size="small"
            >
              {blockDurationOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <FormControlLabel
          control={
            <Checkbox
              checked={config.hasInterval}
              onChange={(e) => saveConfig({ ...config, hasInterval: e.target.checked })}
              size="small"
              sx={{ mt: 1 }}
            />
          }
          label="Ativar intervalo de almoço"
          sx={{ mt: 1, color: "text.primary" }}
        />

        {config.hasInterval && (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TimeSelect
                label="Início do intervalo"
                value={config.intervalStart}
                onChange={(time) => saveConfig({ ...config, intervalStart: time, hasInterval: true })}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Duração (min)"
                type="number"
                value={config.intervalDuration}
                onChange={(e) =>
                  saveConfig({
                    ...config,
                    intervalDuration: Number(e.target.value),
                    hasInterval: true,
                  })
                }
                fullWidth
                size="small"
                inputProps={{ min: 15, max: 120 }}
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 2, borderRadius: 3, backgroundColor: "background.paper" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>
          Selecionar Período
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Clique nos dias que deseja gerar horários
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={null}
            onChange={handleCalendarChange}
            shouldDisableDate={shouldDisableDate}
            minDate={dayjs()}
            maxDate={dayjs().add(60, "day")}
            slots={{ day: DayComponent }}
            sx={{ 
              width: "100%", 
              maxWidth: 350, 
              mx: "auto",
              "& .MuiPickersCalendarHeader-root": { color: "text.primary" },
              "& .MuiDayCalendar-weekDayLabel": { color: "text.secondary" },
              "& .MuiPickersDay-root": { color: "text.primary" },
            }}
          />
        </LocalizationProvider>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          {selectionText && (
            <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
              {selectionText}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || selectedDays.length === 0}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccessTimeIcon />}
            sx={{ px: 4 }}
          >
            {loading ? "Gerando..." : "Gerar Horários"}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: "background.paper" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}>
          Meus Horários
        </Typography>

        {loadingSlots ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : daysWithSlots.size === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Nenhum horário cadastrado
          </Typography>
        ) : (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={null}
              onChange={(date) => {
                if (date) {
                  const dateStr = date.format("YYYY-MM-DD");
                  if (daysWithSlots.has(dateStr)) {
                    handleDayClick({ currentTarget: document.createElement("div") } as unknown as React.MouseEvent<HTMLElement>, dateStr);
                  }
                }
              }}
              minDate={dayjs()}
              shouldDisableDate={(date) => {
                const dateStr = date.format("YYYY-MM-DD");
                return !daysWithSlots.has(dateStr);
              }}
              sx={{ 
                width: "100%", 
                maxWidth: 350, 
                mx: "auto",
                "& .MuiPickersCalendarHeader-root": { color: "text.primary" },
                "& .MuiDayCalendar-weekDayLabel": { color: "text.secondary" },
                "& .MuiPickersDay-root": { color: "text.primary" },
              }}
            />
          </LocalizationProvider>
        )}
      </Paper>

      <Popover
        open={!!selectedDayAnchor}
        anchorEl={selectedDayAnchor?.el}
        onClose={() => {
          setSelectedDayAnchor(null);
          setSelectedSlots([]);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        PaperProps={{ sx: { backgroundColor: "background.paper", minWidth: 300 } }}
      >
        <Box sx={{ p: 2, maxHeight: 400, overflow: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {selectedDayAnchor?.date && dayjs(selectedDayAnchor.date).format("DD/MM/YYYY")}
            </Typography>
            <IconButton size="small" onClick={() => {
              setSelectedDayAnchor(null);
              setSelectedSlots([]);
            }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {selectedDayAnchor && getSlotsForDay(selectedDayAnchor.date).length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
              Nenhum horário disponível
            </Typography>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
                {selectedDayAnchor && getSlotsForDay(selectedDayAnchor.date).map((slot) => (
                  <FormControlLabel
                    key={slot.id}
                    control={
                      <Checkbox
                        size="medium"
                        checked={selectedSlots.includes(slot.id)}
                        onChange={() => handleCheckboxChange(slot.id)}
                      />
                    }
                    label={
                      <Typography color="text.primary">
                        {dayjs(slot.date).format("HH:mm")}
                      </Typography>
                    }
                    sx={{ 
                      margin: 0,
                      "&:hover": { backgroundColor: "action.hover", borderRadius: 1 }
                    }}
                  />
                ))}
              </Box>
              
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button 
                  size="small" 
                  onClick={handleSelectAll}
                  disabled={!selectedDayAnchor}
                >
                  {selectedDayAnchor && selectedSlots.length === getSlotsForDay(selectedDayAnchor.date).length 
                    ? "Desmarcar Todos" 
                    : "Selecionar Todos"}
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
              </Box>
            </>
          )}
        </Box>
      </Popover>

      <Dialog 
        open={!!warningDialog} 
        onClose={() => setWarningDialog(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { backgroundColor: "background.paper" } }}
      >
        <DialogTitle sx={{ color: "text.primary" }}>Atenção</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {warningDialog?.warning?.message}
          </Alert>
          <FormControl>
            <FormLabel sx={{ color: "text.primary" }}>Escolha uma opção:</FormLabel>
            <RadioGroup>
              {warningDialog?.warning?.options.map((opt, idx) => (
                <FormControlLabel
                  key={idx}
                  value={idx.toString()}
                  control={<Radio />}
                  label={`${opt.start} - ${opt.end}`}
                  sx={{ color: "text.primary" }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningDialog(null)} sx={{ color: "text.secondary" }}>Cancelar</Button>
          <Button variant="contained" onClick={() => handleWarningConfirm(0)}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleteDialog.loading && setDeleteDialog({ open: false, loading: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: "background.paper" } }}
      >
        <DialogTitle sx={{ color: "text.primary" }}>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography color="text.primary">
            Tem certeza que deseja excluir {selectedSlots.length} horário(s) selecionado(s)?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, loading: false })} 
            disabled={deleteDialog.loading}
            sx={{ color: "text.secondary" }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleDeleteSelected}
            disabled={deleteDialog.loading}
          >
            {deleteDialog.loading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
