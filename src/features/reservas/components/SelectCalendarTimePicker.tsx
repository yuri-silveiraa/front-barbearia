import { type FC, useMemo, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ScheduleIcon from "@mui/icons-material/Schedule";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import type { TimeSlot } from "../../../api/reservas/types";

dayjs.locale("pt-br");

interface CalendarTimePickerProps {
  times: TimeSlot[];
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error?: string;
}

function parseSlotDate(value: string): dayjs.Dayjs | null {
  if (!value) return null;

  const direct = dayjs(value);
  if (direct.isValid()) {
    return direct;
  }

  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = dayjs(`${year}-${month}-${day}`);
  return parsed.isValid() ? parsed : null;
}

function getSlotDateValue(slot: TimeSlot): string {
  return slot.date ?? slot.data ?? "";
}

const CalendarTimePicker: FC<CalendarTimePickerProps> = ({
  times,
  value,
  onChange,
  loading,
  error,
}) => {
  const groupedDates = useMemo(() => {
    const map = new Map<string, TimeSlot[]>();
    const now = dayjs();

    times.forEach((slot) => {
      const parsed = parseSlotDate(getSlotDateValue(slot));
      if (!parsed || parsed.isBefore(now)) return;

      const key = parsed.format("YYYY-MM-DD");
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, slots]) => ({
        date,
        slots: slots.sort((a, b) => {
          const left = parseSlotDate(getSlotDateValue(a))?.valueOf() ?? 0;
          const right = parseSlotDate(getSlotDateValue(b))?.valueOf() ?? 0;
          return left - right;
        }),
      }));
  }, [times]);

  const initialDate = groupedDates[0]?.date ?? "";
  const [selectedDate, setSelectedDate] = useState("");
  const currentDate = selectedDate || initialDate;
  const timesForSelectedDate = groupedDates.find((group) => group.date === currentDate)?.slots ?? [];

  if (!loading && groupedDates.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <CalendarMonthIcon sx={{ color: "text.disabled", mb: 1 }} />
        <Typography color="text.secondary">Nenhum horário disponível para este barbeiro.</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
        Escolha data e horário
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Selecione uma data disponível e toque no melhor horário.
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        Datas disponíveis
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 1,
          scrollbarWidth: "thin",
        }}
      >
        {groupedDates.map((group) => {
          const selected = group.date === currentDate;
          const date = dayjs(group.date);

          return (
            <Paper
              key={group.date}
              component="button"
              type="button"
              elevation={0}
              disabled={loading}
              onClick={() => {
                setSelectedDate(group.date);
                onChange("");
              }}
              sx={{
                minWidth: 92,
                p: 1.25,
                borderRadius: 2,
                border: "1px solid",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "rgba(0, 191, 165, 0.08)" : "background.paper",
                color: "inherit",
                cursor: loading ? "default" : "pointer",
                textAlign: "left",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {date.format("ddd")}
              </Typography>
              <Typography fontWeight={900}>{date.format("DD/MM")}</Typography>
              <Typography variant="caption" color="text.secondary">
                {group.slots.length} horários
              </Typography>
            </Paper>
          );
        })}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, mb: 1 }}>
        Horários
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1 }}>
        {timesForSelectedDate.map((slot) => {
          const parsed = parseSlotDate(getSlotDateValue(slot));
          const selected = value === slot.id;

          return (
            <Paper
              key={slot.id}
              component="button"
              type="button"
              elevation={0}
              disabled={loading}
              onClick={() => onChange(slot.id)}
              sx={{
                p: 1.25,
                minHeight: 52,
                borderRadius: 2,
                border: "1px solid",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "rgba(0, 191, 165, 0.08)" : "background.paper",
                color: selected ? "primary.main" : "inherit",
                cursor: loading ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <ScheduleIcon fontSize="small" />
              <Typography fontWeight={800}>
                {parsed ? parsed.format("HH:mm") : slot.data}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default CalendarTimePicker;
