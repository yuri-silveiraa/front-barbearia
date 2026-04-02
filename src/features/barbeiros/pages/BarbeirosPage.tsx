import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Navigate } from "react-router-dom";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { BarbeiroForm } from "../components/BarbeiroForm";
import { BarbeiroCard } from "../components/BarbeiroCard";
import { useAuth } from "../../../contexts/AuthContext";
import { createBarber, deactivateBarber, getBarbersAdmin } from "../../../api/barbeiros/barbeiros.service";
import type { BarberAdmin, CreateBarberPayload } from "../types";

export default function BarbeirosPage() {
  const { user } = useAuth();
  const isAdmin = user?.type === "BARBER" && user.isAdmin;

  const [barbers, setBarbers] = useState<BarberAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [barberToDeactivate, setBarberToDeactivate] = useState<BarberAdmin | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isAdmin) {
    return <Navigate to="/agenda" replace />;
  }

  const loadBarbers = async () => {
    try {
      setLoading(true);
      const data = await getBarbersAdmin();
      setBarbers(data);
    } catch {
      setError("Erro ao carregar barbeiros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  const handleOpenForm = () => setFormOpen(true);
  const handleCloseForm = () => setFormOpen(false);

  const handleSave = async (data: CreateBarberPayload) => {
    if (!data.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (!data.email.includes("@")) {
      setError("Email inválido");
      return;
    }
    if (data.telefone.replace(/\D/g, "").length < 11) {
      setError("Telefone inválido");
      return;
    }
    if (data.senha.length < 6) {
      setError("Senha deve ter ao menos 6 caracteres");
      return;
    }

    try {
      setSaving(true);
      await createBarber(data);
      setSuccess("Barbeiro criado com sucesso");
      handleCloseForm();
      loadBarbers();
    } catch {
      setError("Erro ao criar barbeiro");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (barber: BarberAdmin) => {
    setBarberToDeactivate(barber);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!barberToDeactivate) return;
    try {
      setDeleting(true);
      await deactivateBarber(barberToDeactivate.userId);
      setSuccess("Barbeiro desativado com sucesso");
      loadBarbers();
    } catch {
      setError("Erro ao desativar barbeiro");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setBarberToDeactivate(null);
    }
  };

  return (
    <Box>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess("")} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Gerenciar Barbeiros
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
          Novo Barbeiro
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : barbers.length === 0 ? (
        <Typography color="text.secondary" align="center" py={4}>
          Nenhum barbeiro cadastrado
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {barbers.map((barber) => (
            <Box key={barber.id}>
              <BarbeiroCard barber={barber} onDeactivate={handleDeactivate} />
            </Box>
          ))}
        </Box>
      )}

      <BarbeiroForm open={formOpen} onClose={handleCloseForm} onSave={handleSave} loading={saving} />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Desativação</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja desativar "{barberToDeactivate?.nome}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={confirmDeactivate} color="error" disabled={deleting}>
            {deleting ? "Desativando..." : "Desativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
