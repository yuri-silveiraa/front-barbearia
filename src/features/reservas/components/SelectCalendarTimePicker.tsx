import { type FC, useMemo, useState } from "react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import type { TimeSlot } from "../../../api/reservas/types";

interface CalendarTimePickerProps {
  times: TimeSlot[];
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error?: string;
}

const CalendarTimePicker: FC<CalendarTimePickerProps> = ({
  times,
  value,
  onChange,
  loading,
  error,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    times.forEach(slot => {
      const match = slot.data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        dates.add(`${year}-${month}-${day}`);
      }
    });
    return dates;
  }, [times]);

  const timesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return times.filter(slot => {
      const match = slot.data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const [, day, month, year] = match;
        const slotDate = `${year}-${month}-${day}`;
        return slotDate === selectedDate;
      }
      return false;
    });
  }, [times, selectedDate]);

  const handleOpenCalendar = () => setCalendarOpen(true);
  const handleCloseCalendar = () => setCalendarOpen(false);

  const handleDateSelect = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format("YYYY-MM-DD"));
    } else {
      setSelectedDate(null);
    }
    onChange("");
    setCalendarOpen(false);
  };

  const formattedDate = selectedDate 
    ? dayjs(selectedDate).format("DD/MM/YYYY") 
    : "";

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Data
      </Typography>
      
      <Paper
        onClick={handleOpenCalendar}
        sx={{
          p: 2,
          borderRadius: 1,
          border: "1px solid",
          borderColor: error ? "error.main" : "divider",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 1,
          "&:hover": { borderColor: "primary.main" }
        }}
      >
        <CalendarMonthIcon color="primary" />
        <Typography variant="body1" sx={{ flex: 1 }}>
          {formattedDate || "Selecione uma data"}
        </Typography>
      </Paper>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5, display: "block" }}>
          {error}
        </Typography>
      )}

      <Dialog open={calendarOpen} onClose={handleCloseCalendar} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Selecione a Data
          <IconButton onClick={handleCloseCalendar} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              value={selectedDate ? dayjs(selectedDate) : null}
              onChange={handleDateSelect}
              shouldDisableDate={(date) => !availableDates.has(date.format("YYYY-MM-DD"))}
              sx={{ width: "100%" }}
            />
          </LocalizationProvider>
        </DialogContent>
      </Dialog>

      {selectedDate && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Horário
          </Typography>
          <FormControl fullWidth error={!!error} size="small">
            <InputLabel id="time-select-label">Selecione o horário</InputLabel>
            <Select
              labelId="time-select-label"
              value={value}
              onChange={(e) => onChange(e.target.value as string)}
              label="Selecione o horário"
              disabled={loading || timesForSelectedDate.length === 0}
            >
              {timesForSelectedDate.map((slot) => {
                const match = slot.data.match(/(\d{2}):(\d{2})/);
                const time = match ? `${match[1]}:${match[2]}` : slot.data;
                return (
                  <MenuItem key={slot.id} value={slot.id}>
                    {time}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

export default CalendarTimePicker;
