import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { registerSchema } from "../../../api/auth/schema";
import { registerService } from "../../../api/auth/auth.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { AuthLayout } from "../../../layouts/AuthLayout";
import { formatName } from "../../../utils/formatName";
import type { RegisterData } from "../../../api/auth/schema";

export function CadastroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const STORAGE_KEY = "cadastro_form_data";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema)
  });
  const nameValue = watch("name") ?? "";
  const telephoneValue = watch("telephone") ?? "";

  useEffect(() => {
    const emailFromState = (location.state as { email?: string } | null)?.email;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<RegisterData>;
        reset((current) => ({ ...current, ...parsed }));
      } catch {
        // ignore corrupted storage
      }
    }
    if (emailFromState) {
      reset((current) => ({ ...current, email: emailFromState }));
    }
  }, [location.state, reset, STORAGE_KEY]);

  useEffect(() => {
    const subscription = watch((value) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, STORAGE_KEY]);

  async function onSubmit(data: RegisterData) {
    try {
      setError("");
      await registerService({
        ...data,
        name: formatName(data.name),
        telephone: data.telephone
      });
      sessionStorage.removeItem(STORAGE_KEY);
      navigate("/verificar-email", { state: { email: data.email } });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message: string }).message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro de conexão. Tente novamente mais tarde.");
      }
    }
  }

  const formatWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  return (
    <>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <AuthLayout
        title="Criar Conta"
        subtitle="Cadastre-se para fazer suas reservas"
        showBack
        onBack={() => navigate("/login")}
        backgroundImage="/images/barbeiro-background-login.jpg"
      >
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Nome completo"
              fullWidth
              margin="normal"
              {...register("name")}
              value={nameValue}
              onChange={(event) => {
                const sanitized = event.target.value.replace(/[0-9]/g, "");
                setValue("name", sanitized, { shouldValidate: true });
              }}
              error={!!errors.name}
              helperText={errors.name?.message}
              autoComplete="name"
              size="medium"
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
              size="medium"
            />

            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="new-password"
              size="medium"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Confirmar senha"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              autoComplete="new-password"
              size="medium"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="WhatsApp"
              fullWidth
              margin="normal"
              {...register("telephone")}
              value={telephoneValue}
              onChange={(event) => {
                const masked = formatWhatsapp(event.target.value);
                setValue("telephone", masked, { shouldValidate: true });
              }}
              error={!!errors.telephone}
              helperText={errors.telephone?.message || "Ex: (11) 91234-5678"}
              autoComplete="tel"
              placeholder="(11) 91234-5678"
              inputProps={{ inputMode: "numeric" }}
              size="medium"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{ 
                mt: 3, 
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem"
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Cadastrar"}
            </Button>
          </form>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Já tem uma conta?{" "}
              <Typography
                component="span"
                variant="body2"
                sx={{ 
                  color: "primary.main", 
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" }
                }}
                onClick={() => navigate("/login")}
              >
                Entre
              </Typography>
            </Typography>
          </Box>
      </AuthLayout>
    </>
  );
}
