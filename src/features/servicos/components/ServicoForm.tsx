import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from "@mui/material";
import type { Service, CreateServiceData } from "../types";

interface ServicoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateServiceData) => Promise<void>;
  initialData?: Service | null;
  loading?: boolean;
}

const initialForm: CreateServiceData = {
  nome: "",
  descrição: "",
  preço: 0,
};

export function ServicoForm({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  loading = false 
}: ServicoFormProps) {
  const form: CreateServiceData = initialData 
    ? {
        nome: initialData.nome,
        descrição: initialData.descrição || "",
        preço: typeof initialData.preço === 'string' ? parseFloat(initialData.preço) : initialData.preço,
      }
    : initialForm;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: CreateServiceData = {
      nome: formData.get("nome") as string,
      descrição: formData.get("descrição") as string || undefined,
      preço: Number(formData.get("preço")),
    };
    await onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? "Editar Serviço" : "Novo Serviço"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              name="nome"
              label="Nome"
              defaultValue={form.nome}
              fullWidth
              required
              autoFocus
            />
            <TextField
              name="descrição"
              label="Descrição"
              defaultValue={form.descrição}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              name="preço"
              label="Preço (R$)"
              type="number"
              defaultValue={form.preço}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
