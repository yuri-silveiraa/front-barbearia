import { type FC } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

interface SelectBarberProps {
  barbers: any[];
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
  return (
    <FormControl fullWidth margin="normal" error={!!error}>
      <InputLabel>Selecione o barbeiro</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        label="Selecione o barbeiro"
        disabled={loading || barbers.length === 0}
      >
        {barbers.map((b) => (
          <MenuItem key={b.id} value={b.id}>
            {b.nome}
          </MenuItem>
        ))}
      </Select>
      {error && <Typography color="error">{error}</Typography>}
    </FormControl>
  );
};

export default SelectBarber;