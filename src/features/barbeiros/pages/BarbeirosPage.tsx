import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import GroupsIcon from "@mui/icons-material/Groups";
import { Navigate } from "react-router-dom";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { CardGridSkeleton, MetricsSkeleton } from "../../../components/skeletons/AppSkeletons";
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

  const staffBarbers = barbers.filter((barber) => !barber.isAdmin);
  const activeCount = staffBarbers.filter((barber) => barber.isActive).length;
  const inactiveCount = staffBarbers.length - activeCount;

  const loadBarbers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBarbersAdmin();
      setBarbers(data);
    } catch {
      setError("Erro ao carregar barbeiros");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadBarbers();
  }, [isAdmin, loadBarbers]);

  if (!isAdmin) {
    return <Navigate to="/agenda" replace />;
  }

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
    <Box sx={{ width: "100%", maxWidth: 1040, mx: "auto", pb: 2 }}>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess("")} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Equipe
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: 28, sm: 34 },
              fontWeight: 800,
              lineHeight: 1.05,
              mb: 1,
            }}
          >
            Barbeiros da barbearia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre profissionais, acompanhe quem está ativo e controle o acesso à agenda.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
          sx={{ width: { xs: "100%", sm: "auto" }, minHeight: 44, borderRadius: "8px" }}
        >
          Novo barbeiro
        </Button>
      </Box>

      {loading ? (
        <MetricsSkeleton columns={{ xs: "1fr 1fr", sm: "repeat(3, 1fr)" }} />
      ) : (
        <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
          gap: 1,
          mb: 2,
        }}
      >
        {[
          { label: "Barbeiros", value: String(staffBarbers.length), icon: <GroupsIcon fontSize="small" /> },
          { label: "Ativos", value: String(activeCount), icon: <ContentCutIcon fontSize="small" /> },
          { label: "Inativos", value: String(inactiveCount), icon: <BlockIcon fontSize="small" /> },
        ].map((item) => (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: { xs: 1.25, sm: 1.75 },
              minHeight: 88,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ color: "text.secondary", display: "flex" }}>{item.icon}</Box>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          </Paper>
        ))}
        </Box>
      )}

      {loading ? (
        <CardGridSkeleton variant="barber" />
      ) : staffBarbers.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            borderRadius: "8px",
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <GroupsIcon sx={{ fontSize: 52, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum barbeiro cadastrado
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Cadastre o primeiro profissional para começar a organizar a agenda.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm} sx={{ minHeight: 44 }}>
            Cadastrar primeiro barbeiro
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid", 
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
            gap: 1.5,
          }}
        >
          {staffBarbers.map((barber) => (
            <BarbeiroCard key={barber.id} barber={barber} onDeactivate={handleDeactivate} />
          ))}
        </Box>
      )}

      <BarbeiroForm open={formOpen} onClose={handleCloseForm} onSave={handleSave} loading={saving} />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "8px", m: { xs: 1.5, sm: 3 } } }}
      >
        <DialogTitle>Desativar barbeiro</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              O barbeiro não poderá acessar o sistema após a desativação.
            </Alert>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Profissional selecionado
              </Typography>
              <Typography fontWeight={800}>{barberToDeactivate?.nome}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting} fullWidth>
            Cancelar
          </Button>
          <Button onClick={confirmDeactivate} color="error" variant="contained" disabled={deleting} fullWidth>
            {deleting ? "Desativando..." : "Desativar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
