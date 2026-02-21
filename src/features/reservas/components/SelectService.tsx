import { type FC } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import type { Service } from "../../../api/reservas/types";

interface SelectServiceProps {
  services: Service[];
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error?: string;
}

const SelectService: FC<SelectServiceProps> = ({
  services,
  value,
  onChange,
  loading,
  error,
}) => {
  const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <InputLabel>Serviço</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        label="Serviço"
        disabled={loading || services.length === 0}
      >
        {services.map((s) => (
          <MenuItem key={s.id} value={String(s.id)}>
            {[
              s.name?.trim() || "Serviço sem nome",
              Number.isFinite(s.price) ? currencyFormatter.format(s.price) : undefined,
              s.description?.trim() || undefined,
            ]
              .filter(Boolean)
              .join(" - ")}
          </MenuItem>
        ))}
      </Select>
      {error && <Typography color="error">{error}</Typography>}
    </FormControl>
  );
};

export default SelectService;
