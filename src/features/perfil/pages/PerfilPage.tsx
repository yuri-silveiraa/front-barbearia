import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
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
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../../../contexts/AuthContext";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { formatName } from "../../../utils/formatName";
import { formatWhatsappDisplay, onlyDigits } from "../../../utils/customerInput";
import {
  needsCurrentPasswordError,
  passwordChangeSchema,
  type PasswordChangeForm,
} from "../utils/passwordChangeValidation";

const profileSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome precisa ter no mínimo 3 caracteres")
    .regex(/^[\p{L}\s]+$/u, "Nome deve conter apenas letras"),
  email: z.string().email("Email inválido").trim(),
  telephone: z.string().trim().refine((value) => onlyDigits(value).length >= 10, "Telefone inválido"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function PerfilPage() {
  const { user, updateUser, changePassword, deleteUser } = useAuth();
  const navigate = useNavigate();
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profileImageUrl ?? null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [profileImageError, setProfileImageError] = useState("");
  const [passwordFormError, setPasswordFormError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      telephone: user?.phone || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
    setError: setPasswordFieldError,
  } = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    resetProfile({
      name: user?.name || "",
      email: user?.email || "",
      telephone: user?.phone || "",
    });
    setProfileImageFile(null);
    setProfileImagePreview(user?.profileImageUrl ?? null);
    setRemoveProfileImage(false);
    setProfileImageError("");
  }, [user, resetProfile, editOpen]);

  useEffect(() => {
    if (!passwordOpen) {
      resetPassword();
      setPasswordFormError("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [passwordOpen, resetPassword]);

  useEffect(() => {
    return () => {
      if (profileImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) return;

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      setProfileImageError("Use uma imagem JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      setProfileImageError("A imagem deve ter no máximo 5MB.");
      event.target.value = "";
      return;
    }

    if (profileImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImagePreview);
    }

    setProfileImageError("");
    setProfileImageFile(file);
    setRemoveProfileImage(false);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveProfileImage = () => {
    if (profileImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImagePreview);
    }

    setProfileImageFile(null);
    setProfileImagePreview(null);
    setProfileImageError("");
    setRemoveProfileImage(Boolean(user?.profileImageUrl));
  };

  const onSubmit = async (data: ProfileForm) => {
    setError(null);
    setSuccess(null);
    try {
      await updateUser({
        name: formatName(data.name),
        email: data.email,
        telephone: onlyDigits(data.telephone),
        profileImageFile,
        removeProfileImage,
      });
      setSuccess("Perfil atualizado com sucesso.");
      setProfileImageFile(null);
      setRemoveProfileImage(false);
      setEditOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar perfil";
      setError(message);
    }
  };

  const onPasswordSubmit = async (data: PasswordChangeForm) => {
    setError(null);
    setSuccess(null);
    setPasswordFormError("");

    if (needsCurrentPasswordError(user?.hasPassword !== false, data.currentPassword)) {
      setPasswordFieldError("currentPassword", {
        type: "manual",
        message: "Informe sua senha atual",
      });
      return;
    }

    try {
      await changePassword({
        currentPassword: user?.hasPassword === false ? undefined : data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess("Senha alterada com sucesso.");
      resetPassword();
      setPasswordOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao alterar senha";
      setPasswordFormError(message);
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
  const userHasPassword = user?.hasPassword !== false;

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
              src={user?.profileImageUrl || undefined}
              alt={user?.name || "Usuário"}
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
            borderColor: "divider",
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
                bgcolor: "action.hover",
                color: "primary.main",
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                Segurança
              </Typography>
              <Typography fontWeight={800}>{userHasPassword ? "Alterar senha" : "Criar senha de acesso"}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                {userHasPassword
                  ? "Troque sua senha usando a senha atual para confirmar sua identidade."
                  : "Sua conta entrou pelo Google. Crie uma senha para também acessar com email e senha."}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<LockOutlinedIcon />}
                onClick={() => setPasswordOpen(true)}
                fullWidth
                sx={{ minHeight: 42 }}
              >
                {userHasPassword ? "Alterar senha" : "Criar senha"}
              </Button>
            </Box>
          </Box>
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
        onClose={() => !isSubmittingProfile && setEditOpen(false)}
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
          <Box component="form" onSubmit={handleProfileSubmit(onSubmit)} sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.default",
                }}
              >
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", mb: 1.5 }}>
                  <Avatar
                    src={profileImagePreview || undefined}
                    alt={user?.name || "Usuário"}
                    sx={{
                      width: 64,
                      height: 64,
                      fontSize: 22,
                      fontWeight: 800,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      flexShrink: 0,
                    }}
                  >
                    {user?.name ? getInitials(user.name) : "U"}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography fontWeight={800}>Foto de perfil</Typography>
                    <Typography variant="body2" color="text.secondary">
                      JPG, PNG ou WEBP com até 5MB.
                    </Typography>
                  </Box>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button variant="outlined" component="label" startIcon={<ImageIcon />} fullWidth>
                    {profileImagePreview ? "Trocar foto" : "Selecionar foto"}
                    <input
                      hidden
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleProfileImageChange}
                    />
                  </Button>

                  {profileImagePreview && (
                    <Button color="inherit" onClick={handleRemoveProfileImage} startIcon={<DeleteOutlineIcon />} fullWidth>
                      Remover foto
                    </Button>
                  )}
                </Stack>

                {profileImageError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {profileImageError}
                  </Alert>
                )}
              </Box>

              <TextField
                label="Nome"
                fullWidth
                {...registerProfile("name")}
                error={!!profileErrors.name}
                helperText={profileErrors.name?.message}
                autoComplete="name"
              />
              <TextField
                label="Email"
                fullWidth
                {...registerProfile("email")}
                error={!!profileErrors.email}
                helperText={profileErrors.email?.message}
                autoComplete="email"
              />
              <TextField
                label="WhatsApp"
                fullWidth
                {...registerProfile("telephone")}
                error={!!profileErrors.telephone}
                helperText={profileErrors.telephone?.message || "Ex: (11) 99999-9999"}
                autoComplete="tel"
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setEditOpen(false)} disabled={isSubmittingProfile} fullWidth>
            Cancelar
          </Button>
          <Button
            onClick={handleProfileSubmit(onSubmit)}
            variant="contained"
            disabled={isSubmittingProfile || Boolean(profileImageError)}
            fullWidth
          >
            {isSubmittingProfile ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordOpen}
        onClose={() => !isSubmittingPassword && setPasswordOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 2, m: { xs: 1.5, sm: 3 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
            Segurança
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            {userHasPassword ? "Alterar senha" : "Criar senha"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} sx={{ pt: 1 }}>
            <Stack spacing={2}>
              {!userHasPassword && (
                <Alert severity="info">
                  Como sua conta usa Google, você pode criar uma senha local sem informar senha atual.
                </Alert>
              )}

              {passwordFormError && <Alert severity="error">{passwordFormError}</Alert>}

              {userHasPassword && (
                <TextField
                  label="Senha atual"
                  type={showCurrentPassword ? "text" : "password"}
                  fullWidth
                  {...registerPassword("currentPassword")}
                  error={!!passwordErrors.currentPassword}
                  helperText={passwordErrors.currentPassword?.message}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showCurrentPassword ? "Ocultar senha atual" : "Mostrar senha atual"}
                          onClick={() => setShowCurrentPassword((value) => !value)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              <TextField
                label="Nova senha"
                type={showNewPassword ? "text" : "password"}
                fullWidth
                {...registerPassword("newPassword")}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword?.message || "Use no mínimo 6 caracteres com letra maiúscula, minúscula e número."}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showNewPassword ? "Ocultar nova senha" : "Mostrar nova senha"}
                        onClick={() => setShowNewPassword((value) => !value)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Confirmar nova senha"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                {...registerPassword("confirmPassword")}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword?.message}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"}
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
          <Button onClick={() => setPasswordOpen(false)} disabled={isSubmittingPassword} fullWidth>
            Cancelar
          </Button>
          <Button onClick={handlePasswordSubmit(onPasswordSubmit)} variant="contained" disabled={isSubmittingPassword} fullWidth>
            {isSubmittingPassword ? "Salvando..." : userHasPassword ? "Alterar senha" : "Criar senha"}
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
