import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import type { CreateBarberPayload } from "../types";

interface BarbeiroFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateBarberPayload) => Promise<void>;
  loading?: boolean;
}

export function BarbeiroForm({ open, onClose, onSave, loading = false }: BarbeiroFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CreateBarberPayload = {
      nome: (formData.get("nome") as string) || "",
      email: (formData.get("email") as string) || "",
      telefone: (formData.get("telefone") as string) || "",
      senha: (formData.get("senha") as string) || "",
      isAdmin: formData.get("isAdmin") === "on",
    };
    await onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Novo Barbeiro</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              name="nome"
              label="Nome"
              fullWidth
              required
              autoFocus
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              required
            />
            <TextField
              name="telefone"
              label="Telefone"
              fullWidth
              required
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
            <TextField
              name="senha"
              label="Senha"
              type="password"
              fullWidth
              required
              inputProps={{ minLength: 6 }}
            />
            <FormControlLabel
              control={<Switch name="isAdmin" color="primary" />}
              label="Administrador"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
