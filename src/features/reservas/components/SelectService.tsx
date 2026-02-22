import { type FC } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
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
    <FormControl fullWidth error={!!error} size="small">
      <InputLabel id="service-select-label">Selecione o serviço</InputLabel>
      <Select
        labelId="service-select-label"
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        label="Selecione o serviço"
        disabled={loading || services.length === 0}
        renderValue={(selected) => {
          if (!selected) return "Selecione o serviço";
          const service = services.find(s => s.id === selected);
          if (!service) return selected;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ContentCutIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {service.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currencyFormatter.format(service.price)}
                </Typography>
              </Box>
            </Box>
          );
        }}
        sx={{
          "& .MuiSelect-select": {
            py: 1.5
          }
        }}
      >
        {services.map((s) => (
          <MenuItem 
            key={s.id} 
            value={String(s.id)}
            sx={{
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.5
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
              <ContentCutIcon fontSize="small" color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                {s.name}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                {currencyFormatter.format(s.price)}
              </Typography>
            </Box>
            {s.description && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                {s.description}
              </Typography>
            )}
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

export default SelectService;
