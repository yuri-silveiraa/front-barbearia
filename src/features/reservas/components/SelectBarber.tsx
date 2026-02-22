import { type FC } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar
} from "@mui/material";
import type { Barber } from "../../../api/reservas/types";

interface SelectBarberProps {
  barbers: Barber[];
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error?: string;
}

const SelectBarber: FC<SelectBarberProps> = ({
  barbers,
  value,
  onChange,
  loading,
  error,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <FormControl fullWidth error={!!error} size="small">
      <InputLabel id="barber-select-label">Selecione o barbeiro</InputLabel>
      <Select
        labelId="barber-select-label"
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        label="Selecione o barbeiro"
        disabled={loading || barbers.length === 0}
        renderValue={(selected) => {
          if (!selected) return "Selecione o barbeiro";
          const barber = barbers.find(b => b.id === selected);
          if (!barber) return selected;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "0.875rem",
                  bgcolor: "primary.main"
                }}
              >
                {getInitials(barber.name)}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {barber.name}
              </Typography>
            </Box>
          );
        }}
        sx={{
          "& .MuiSelect-select": {
            py: 1.5
          }
        }}
      >
        {barbers.map((b) => (
          <MenuItem 
            key={b.id} 
            value={String(b.id)}
            sx={{
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: "0.875rem",
                bgcolor: "primary.light"
              }}
            >
              {getInitials(b.name)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {b.name}
              </Typography>
              {b.specialties && b.specialties.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {b.specialties.join(", ")}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
          {error}
        </Typography>
      )}
    </FormControl>
  );
};

export default SelectBarber;
