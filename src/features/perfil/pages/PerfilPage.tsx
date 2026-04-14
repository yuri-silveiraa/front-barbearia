import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { useAuth } from "../../../contexts/AuthContext";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { formatName } from "../../../utils/formatName";
import { formatWhatsappDisplay, onlyDigits } from "../../../utils/customerInput";

const profileSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome precisa ter no mínimo 3 caracteres")
    .regex(/^[\p{L}\s]+$/u, "Nome deve conter apenas letras"),
  email: z.string().email("Email inválido").trim(),
  telephone: z.string().trim().refine((value) => onlyDigits(value).length >= 10, "Telefone inválido"),
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
        name: formatName(data.name),
        email: data.email,
        telephone: onlyDigits(data.telephone),
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

  const profileRole = user?.type === "BARBER" ? (user.isAdmin ? "Barbeiro admin" : "Barbeiro") : "Cliente";
  const formattedPhone = user?.phone ? formatWhatsappDisplay(user.phone) : "Não informado";

  const profileItems = [
    {
      label: "Nome",
      value: user?.name || "Não informado",
      icon: <PersonIcon color="primary" />,
    },
    {
      label: "Email",
      value: user?.email || "Não informado",
      icon: <EmailIcon color="primary" />,
    },
    {
      label: "WhatsApp",
      value: formattedPhone,
      icon: <PhoneIcon color="primary" />,
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 760, mx: "auto", pb: 2 }}>
      <FeedbackBanner message={warning} severity="warning" onClose={() => setWarning(null)} />
      <FeedbackBanner message={error} severity="error" onClose={() => setError(null)} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess(null)} />

      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
          Conta
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
          Meu perfil
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mantenha seus dados atualizados para receber avisos e acessar sua conta.
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: { xs: 72, sm: 88 },
                height: { xs: 72, sm: 88 },
                fontSize: { xs: 26, sm: 32 },
                fontWeight: 800,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                flexShrink: 0,
              }}
            >
              {user?.name ? getInitials(user.name) : "U"}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h5" sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, lineHeight: 1.12 }}>
                {user?.name || "Usuário"}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ overflow: "hidden", textOverflow: "ellipsis", overflowWrap: "anywhere", mt: 0.5 }}
              >
                {user?.email || "Email não informado"}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 1 }}>
                <Chip label={profileRole} color="primary" size="small" />
                {user?.isAdmin && <Chip label="Acesso administrativo" variant="outlined" size="small" />}
              </Stack>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditOpen(true)}
            fullWidth
            sx={{ mt: 2, minHeight: 44 }}
          >
            Editar perfil
          </Button>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Dados da conta
          </Typography>
          <Stack spacing={0.5} divider={<Divider flexItem />}>
            {profileItems.map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "40px minmax(0, 1fr)",
                  gap: 1.5,
                  py: 1.5,
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "action.hover",
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "rgba(244, 67, 54, 0.35)",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "40px minmax(0, 1fr)", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(244, 67, 54, 0.12)",
                color: "error.main",
              }}
            >
              <ShieldOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                Zona de risco
              </Typography>
              <Typography fontWeight={800}>Excluir conta</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                Esta ação desativa seu acesso e remove seus agendamentos futuros.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => setDeleteOpen(true)}
                fullWidth
                sx={{ minHeight: 42 }}
              >
                Excluir conta
              </Button>
            </Box>
          </Box>
        </Paper>
      </Stack>

      <Dialog
        open={editOpen}
        onClose={() => !isSubmitting && setEditOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2, m: { xs: 1.5, sm: 3 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Perfil
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            Editar dados
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <TextField
                label="Nome"
                fullWidth
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
                autoComplete="name"
              />
              <TextField
                label="Email"
                fullWidth
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
              />
              <TextField
                label="WhatsApp"
                fullWidth
                {...register("telephone")}
                error={!!errors.telephone}
                helperText={errors.telephone?.message || "Ex: (11) 99999-9999"}
                autoComplete="tel"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setEditOpen(false)} disabled={isSubmitting} fullWidth>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting} fullWidth>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2, m: { xs: 1.5, sm: 3 } } }}
      >
        <DialogTitle>Excluir conta</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta ação não pode ser desfeita.
          </Alert>
          <Typography>
            Sua conta será desativada e seus agendamentos futuros serão removidos. Seu histórico financeiro será
            preservado.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting} fullWidth>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting} fullWidth>
            {deleting ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
