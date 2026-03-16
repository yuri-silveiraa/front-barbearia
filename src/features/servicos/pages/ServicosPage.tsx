import { useState, useEffect } from "react";
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
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../../api/servicos/servico.service";
import { CardServico } from "../components/CardServico";
import { ServicoForm } from "../components/ServicoForm";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
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
    <Box>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess("")} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Gerenciar Serviços
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Novo Serviço
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : services.length === 0 ? (
        <Typography color="text.secondary" align="center" py={4}>
          Nenhum serviço cadastrado
        </Typography>
      ) : (
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, 
          gap: 2 
        }}>
          {services.map((service) => (
            <Box key={service.id}>
              <CardServico
                service={service}
                onEdit={() => handleOpenForm(service)}
                onDelete={() => handleDelete(service)}
              />
            </Box>
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

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir "{serviceToDelete?.nome}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="error" disabled={deleting}>
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
