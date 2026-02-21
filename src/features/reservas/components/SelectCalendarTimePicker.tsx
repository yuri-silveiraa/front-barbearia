import { type FC, type MouseEvent, useMemo, useState } from "react";
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
import dayjs, { type Dayjs } from "dayjs";
import type { TimeSlot } from "../../../api/reservas/types";

interface CalendarTimePickerProps {
  times: TimeSlot[];
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error?: string;
  selectedBarberId: string;
}

const PT_BR_DATE_TIME_REGEX =
  /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::\d{2})?)?$/;
const ISO_LIKE_DATE_TIME_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2})?)?$/;

function parseDateTime(raw: string): Dayjs | null {
  const text = raw.trim();
  if (!text) {
    return null;
  }

  const normalizedText = text.replace(",", " ").replace(/\s+/g, " ").trim();

  const direct = dayjs(normalizedText);
  if (direct.isValid()) {
    return direct;
  }

  const ptBrMatch = normalizedText.match(PT_BR_DATE_TIME_REGEX);
  if (ptBrMatch) {
    const [, day, month, year, hour = "00", minute = "00"] = ptBrMatch;
    const parsed = dayjs(`${year}-${month}-${day}T${hour}:${minute}`);
    return parsed.isValid() ? parsed : null;
  }

  const isoLikeMatch = normalizedText.match(ISO_LIKE_DATE_TIME_REGEX);
  if (isoLikeMatch) {
    const [, year, month, day, hour = "00", minute = "00"] = isoLikeMatch;
    const parsed = dayjs(`${year}-${month}-${day}T${hour}:${minute}`);
    return parsed.isValid() ? parsed : null;
  }

  return null;
}

function getSlotDate(slot: TimeSlot): Dayjs | null {
  if (slot.data) {
    const parsedData = parseDateTime(slot.data);
    if (parsedData) {
      return parsedData;
    }
  }

  if (slot.time) {
    return parseDateTime(slot.time);
  }

  return null;
}

function getSlotHourLabel(slot: TimeSlot): string {
  const parsed = getSlotDate(slot);
  if (parsed) {
    return parsed.format("HH:mm");
  }

  const source = slot.time || slot.data || "";
  const extractedTime = source.match(/\b\d{2}:\d{2}\b/);
  if (extractedTime) {
    return extractedTime[0];
  }

  return "Horário disponível";
}

const CalendarTimePicker: FC<CalendarTimePickerProps> = ({
  times,
  value,
  onChange,
  loading,
  error,
  selectedBarberId,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const availableTimes = useMemo(
    () => times.filter((slot) => slot.available !== false),
    [times]
  );

  const filteredTimes = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return availableTimes.filter((slot) => {
      const slotDate = getSlotDate(slot);
      return slotDate ? slotDate.isSame(selectedDate, "day") : false;
    });
  }, [availableTimes, selectedDate]);

  const hasTimesOnDate = (date: Dayjs): boolean =>
    availableTimes.some((slot) => {
      const slotDate = getSlotDate(slot);
      return slotDate ? slotDate.isSame(date, "day") : false;
    });

  const openPopover = (anchor: HTMLElement) => {
    setAnchorEl(anchor);
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    openPopover(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const formattedDate = selectedDate
    ? selectedDate.format("DD/MM/YYYY")
    : "";

  return (
    <Box>
      <TextField
        label="Data"
        value={formattedDate}
        placeholder="Selecione a data"
        fullWidth
        margin="normal"
        onClick={handleClick}
        disabled={loading || !selectedBarberId}
        InputProps={{ readOnly: true }}
        sx={{
          "& .MuiInputBase-root": { cursor: "pointer" },
          "& .MuiInputBase-input": { cursor: "pointer" },
        }}
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
              onChange("");
              handleClose();
            }}
            shouldDisableDate={(date) => !hasTimesOnDate(date)}
            sx={{
              "& .MuiPickersDay-root": {
                fontWeight: 500,
              },
              "& .MuiPickersDay-root.Mui-disabled": {
                color: "text.disabled",
              },
              "& .MuiPickersDay-root:not(.Mui-disabled)": {
                backgroundColor: "rgba(46, 125, 50, 0.15)",
                border: "1px solid rgba(46, 125, 50, 0.35)",
                color: "text.primary",
              },
              "& .MuiPickersDay-root:not(.Mui-disabled):hover": {
                backgroundColor: "rgba(46, 125, 50, 0.28)",
              },
              "& .MuiPickersDay-root.Mui-selected": {
                backgroundColor: "primary.main",
                color: "common.white",
                border: "1px solid",
                borderColor: "primary.main",
              },
              "& .MuiPickersDay-root.Mui-selected:hover": {
                backgroundColor: "primary.dark",
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
            disabled={loading || filteredTimes.length === 0}
          >
            {filteredTimes.map((t) => (
              <MenuItem key={t.id} value={String(t.id)}>
                {getSlotHourLabel(t)}
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
