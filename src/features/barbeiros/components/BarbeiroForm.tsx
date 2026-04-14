import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { formatWhatsapp, onlyDigits } from "../../../utils/customerInput";
import type { CreateBarberPayload } from "../types";

interface BarbeiroFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateBarberPayload) => Promise<void>;
  loading?: boolean;
}

export function BarbeiroForm({ open, onClose, onSave, loading = false }: BarbeiroFormProps) {
  if (!open) return null;

  return <BarbeiroFormDialog open={open} onClose={onClose} onSave={onSave} loading={loading} />;
}

function BarbeiroFormDialog({ open, onClose, onSave, loading = false }: BarbeiroFormProps) {
  const [telefone, setTelefone] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CreateBarberPayload = {
      nome: (formData.get("nome") as string) || "",
      email: (formData.get("email") as string) || "",
      telefone: onlyDigits(telefone),
      senha: (formData.get("senha") as string) || "",
    };
    await onSave(data);
  };

  const handleClose = () => {
    if (loading) return;
    setTelefone("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "8px", m: { xs: 1.5, sm: 3 } } }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Equipe
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            Novo barbeiro
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Crie o acesso para um profissional atender e acompanhar a própria agenda.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              name="nome"
              label="Nome"
              fullWidth
              required
              autoFocus
              autoComplete="name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              required
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmailIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="telefone"
              label="WhatsApp"
              value={telefone}
              onChange={(event) => setTelefone(formatWhatsapp(event.target.value))}
              fullWidth
              required
              helperText="Ex: (11) 91234-5678"
              autoComplete="tel"
              placeholder="(11) 91234-5678"
              inputProps={{ inputMode: "numeric" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="senha"
              label="Senha"
              type="password"
              fullWidth
              required
              helperText="Mínimo de 6 caracteres"
              autoComplete="new-password"
              inputProps={{ minLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button onClick={handleClose} disabled={loading} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? "Criando..." : "Criar barbeiro"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
