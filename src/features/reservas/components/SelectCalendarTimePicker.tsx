import { type FC, useState } from "react";
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
  Popover,
  TextField,
} from "@mui/material";
import dayjs from "dayjs"; // Usado apenas para comparações de datas; remova se não precisar

interface CalendarTimePickerProps {
  times: any[]; // Array de { id, data: string (ex: "2024-01-01 10:00") }
  value: string; // timeId selecionado
  onChange: (value: string) => void;
  loading: boolean;
  error?: string;
  selectedBarberId: string; // Para desabilitar se não houver barbeiro
}

const CalendarTimePicker: FC<CalendarTimePickerProps> = ({
  times,
  value,
  onChange,
  loading,
  error,
  selectedBarberId,
}) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const filteredTimes = selectedDate
    ? times.filter((t) =>
        dayjs(t.data.split(" ")[0]).isSame(selectedDate, "day")
      )
    : [];

  const hasTimesOnDate = (date: dayjs.Dayjs) => {
    return times.some((t) =>
      dayjs(t.data.split(" ")[0]).isSame(date, "day")
    );
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const formattedDate = selectedDate
    ? selectedDate.format("DD/MM/YYYY")
    : "Selecione a data";

  return (
    <Box>
      <TextField
        label="Data"
        value={formattedDate}
        fullWidth
        margin="normal"
        onClick={handleClick}
        disabled={loading || !selectedBarberId}
        InputProps={{ readOnly: true }} // Impede edição manual
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDate}
            onChange={(newDate) => {
              setSelectedDate(newDate);
              handleClose();
            }}
            shouldDisableDate={(date) => !hasTimesOnDate(date)}
            sx={{
              "& .MuiPickersDay-root": {
                "&.Mui-disabled": { color: "gray" },
              },
              "& .MuiPickersDay-root:not(.Mui-disabled)": {
                backgroundColor: "lightgreen",
              },
            }}
          />
        </LocalizationProvider>
      </Popover>

      {selectedDate && filteredTimes.length > 0 && (
        <FormControl fullWidth margin="normal" error={!!error}>
          <InputLabel>Horários disponíveis</InputLabel>
          <Select
            value={value}
            onChange={(e) => onChange(e.target.value as string)}
            label="Horários disponíveis"
            disabled={loading}
          >
            {filteredTimes.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.data.split(" ")[1]} {/* Mostra só o horário, assumindo "DD/MM/YYYY HH:mm" */}
              </MenuItem>
            ))}
          </Select>
          {error && <Typography color="error">{error}</Typography>}
        </FormControl>
      )}
    </Box>
  );
};

export default CalendarTimePicker;