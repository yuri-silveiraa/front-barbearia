import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Divider,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { useAuth } from "../../../contexts/AuthContext";
import { FeedbackBanner } from "../../../components/FeedbackBanner";

const profileSchema = z.object({
  name: z.string().trim().min(3, "Nome precisa ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido").trim(),
  telephone: z.string().trim().min(11, "Telefone inválido"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function PerfilPage() {
  const { user, updateUser, deleteUser } = useAuth();
  const navigate = useNavigate();
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      telephone: user?.phone || "",
    },
  });

  useEffect(() => {
    reset({
      name: user?.name || "",
      email: user?.email || "",
      telephone: user?.phone || "",
    });
  }, [user, reset, editOpen]);

  const onSubmit = async (data: ProfileForm) => {
    setError(null);
    setSuccess(null);
    try {
      await updateUser({
        name: data.name,
        email: data.email,
        telephone: data.telephone,
      });
      setSuccess("Perfil atualizado com sucesso.");
      setEditOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar perfil";
      setError(message);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setSuccess(null);
    setDeleting(true);
    try {
      await deleteUser();
      setSuccess("Conta excluída com sucesso.");
      navigate("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir conta";
      setError(message);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 1, sm: 2 } }}>
      <FeedbackBanner message={warning} severity="warning" onClose={() => setWarning(null)} />
      <FeedbackBanner message={error} severity="error" onClose={() => setError(null)} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess(null)} />
      <Typography 
        variant="h4" 
        sx={{ mb: 3, fontWeight: 700, textAlign: "center" }}
      >
        Meu Perfil
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          background: "linear-gradient(135deg, rgba(0,191,165,0.1) 0%, rgba(255,171,0,0.1) 100%)",
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{
                width: { xs: 80, sm: 120 },
                height: { xs: 80, sm: 120 },
                fontSize: { xs: "2rem", sm: "3rem" },
                fontWeight: 700,
                bgcolor: "primary.main",
                boxShadow: "0 4px 20px rgba(0,191,165,0.3)"
              }}
            >
              {user?.name ? getInitials(user.name) : "U"}
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "primary.main",
                borderRadius: "50%",
                p: 0.75,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "primary.dark"
                }
              }}
              onClick={() => setEditOpen(true)}
            >
              <EditIcon sx={{ fontSize: { xs: 16, sm: 20 }, color: "white" }} />
            </Box>
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, textAlign: "center" }}>
            {user?.name || "Usuário"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  flexShrink: 0
                }}
              >
                <PersonIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name || "Não informado"}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setEditOpen(true)}
                sx={{ flexShrink: 0 }}
              >
                Editar
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  flexShrink: 0
                }}
              >
                <EmailIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email || "Não informado"}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setEditOpen(true)}
                sx={{ flexShrink: 0 }}
              >
                Editar
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  flexShrink: 0
                }}
              >
                <PhoneIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Telefone
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.phone || "Não informado"}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setEditOpen(true)}
                sx={{ flexShrink: 0 }}
              >
                Editar
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setDeleteOpen(true)}
          >
            Excluir Conta
          </Button>
        </Box>
      </Paper>

      <Dialog open={editOpen} onClose={() => !isSubmitting && setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              fullWidth
              margin="normal"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Telefone"
              fullWidth
              margin="normal"
              {...register("telephone")}
              error={!!errors.telephone}
              helperText={errors.telephone?.message || "Ex: 11999999999"}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Excluir conta</DialogTitle>
        <DialogContent>
          <Typography>
            Esta ação desativa sua conta e remove seus agendamentos futuros. Seu histórico financeiro é preservado.
            Tem certeza?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
