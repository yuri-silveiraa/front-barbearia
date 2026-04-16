import { useState, useEffect } from "react";
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
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ImageIcon from "@mui/icons-material/Image";
import PaidIcon from "@mui/icons-material/Paid";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../../api/servicos/servico.service";
import { CardServico } from "../components/CardServico";
import { ServicoForm } from "../components/ServicoForm";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { CardGridSkeleton, MetricsSkeleton } from "../../../components/skeletons/AppSkeletons";
import type { Service, CreateServiceData } from "../types";

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const totalServices = services.length;
  const servicesWithImage = services.filter((service) => Boolean(service.imagemUrl)).length;
  const averagePrice =
    totalServices > 0
      ? services.reduce((total, service) => total + Number(service.preço), 0) / totalServices
      : 0;

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await getServices();
      setServices(data);
    } catch {
      setError("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenForm = (service?: Service) => {
    if (service) {
      setEditingService(service);
    } else {
      setEditingService(null);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingService(null);
  };

  const handleSave = async (data: CreateServiceData) => {
    if (!data.nome.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    if (data.preço <= 0) {
      setError("Preço deve ser maior que zero");
      return;
    }

    const payload = {
      nome: data.nome,
      descrição: data.descrição,
      preço: Number(data.preço),
      duration: Number(data.duration),
      imagemArquivo: data.imagemArquivo,
      removerImagem: data.removerImagem,
    };

    try {
      setSaving(true);
      if (editingService) {
        await updateService({ id: editingService.id, ...payload });
        setSuccess("Serviço atualizado com sucesso");
      } else {
        await createService(payload);
        setSuccess("Serviço criado com sucesso");
      }
      handleCloseForm();
      loadServices();
    } catch {
      setError(editingService ? "Erro ao atualizar serviço" : "Erro ao criar serviço");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    
    setDeleting(true);
    try {
      await deleteService(serviceToDelete.id);
      setSuccess("Serviço excluído com sucesso");
      loadServices();
    } catch {
      setError("Erro ao excluir serviço. Verifique se não há agendamentos vinculados.");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
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
            Serviços
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
            Catálogo da barbearia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre os serviços que aparecem para os clientes na hora de agendar.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ width: { xs: "100%", sm: "auto" }, minHeight: 44, borderRadius: "8px" }}
        >
          Novo serviço
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
          { label: "Serviços", value: String(totalServices), icon: <ContentCutIcon fontSize="small" /> },
          { label: "Com imagem", value: String(servicesWithImage), icon: <ImageIcon fontSize="small" /> },
          { label: "Preço médio", value: totalServices > 0 ? formatCurrency(averagePrice) : "--", icon: <PaidIcon fontSize="small" /> },
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
        <CardGridSkeleton variant="service" />
      ) : services.length === 0 ? (
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
          <ContentCutIcon sx={{ fontSize: 52, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Nenhum serviço cadastrado
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Comece pelo serviço mais vendido da barbearia.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()} sx={{ minHeight: 44 }}>
            Cadastrar primeiro serviço
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
          {services.map((service) => (
            <CardServico
              key={service.id}
              service={service}
              onEdit={() => handleOpenForm(service)}
              onDelete={() => handleDelete(service)}
            />
          ))}
        </Box>
      )}

      <ServicoForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        initialData={editingService}
        loading={saving}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "8px", m: { xs: 1.5, sm: 3 } } }}
      >
        <DialogTitle>Excluir serviço</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">Serviços com agendamentos vinculados podem não ser removidos.</Alert>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Serviço selecionado
              </Typography>
              <Typography fontWeight={800}>{serviceToDelete?.nome}</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting} fullWidth>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting} fullWidth>
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
