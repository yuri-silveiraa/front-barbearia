import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { registerSchema } from "../../../api/auth/schema";
import { registerService } from "../../../api/auth/auth.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
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
    watch
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema)
  });

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
      await registerService(data);
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        p: 2
      }}
    >
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 4,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          overflow: "visible"
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/login")}
            sx={{ mb: 2, color: "text.secondary" }}
          >
            Voltar
          </Button>

          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00bfa5 0%, #ffab00 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                boxShadow: "0 8px 20px rgba(0, 191, 165, 0.3)"
              }}
            >
              <ContentCutIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Criar Conta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cadastre-se para fazer suas reservas
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Nome completo"
              fullWidth
              margin="normal"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              autoComplete="name"
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
              label="Telefone"
              fullWidth
              margin="normal"
              {...register("telephone")}
              error={!!errors.telephone}
              helperText={errors.telephone?.message || "Ex: 11999999999"}
              autoComplete="tel"
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
        </CardContent>
      </Card>
    </Box>
  );
}
