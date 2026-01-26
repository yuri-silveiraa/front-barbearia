import { type FC } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

interface SelectServiceProps {
  services: any[];
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
          <MenuItem key={s.id} value={s.id}>
            {s.nome} - R${s.preço} - {s.descrição}
          </MenuItem>
        ))}
      </Select>
      {error && <Typography color="error">{error}</Typography>}
    </FormControl>
  );
};

export default SelectService;