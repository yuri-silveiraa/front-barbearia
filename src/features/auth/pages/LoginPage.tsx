import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { loginSchema } from "../../../api/auth/schema";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { useAuth } from "../../../contexts/AuthContext";
import { AuthLayout } from "../../../layouts/AuthLayout";
import type { LoginData } from "../../../api/auth/schema";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, user, loadingAuth } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    if (loadingAuth || !user) return;

    if (user.type === "BARBER") {
      navigate(user.isAdmin ? "/servicos" : "/agenda", { replace: true });
    } else {
      navigate("/reservas", { replace: true });
    }
  }, [loadingAuth, user, navigate]);

  async function onSubmit(data: LoginData) {
    try {
      setError("");
      const result = await login(data);
      sessionStorage.removeItem("cadastro_form_data");
      if (result?.type === "BARBER") {
        navigate("/agenda", { replace: true });
      } else {
        navigate("/reservas", { replace: true });
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Erro ao fazer login");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro de conexão. Tente novamente mais tarde.");
      }
    }
  }

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      setError("");
      if (!credentialResponse.credential) {
        throw new Error("Token Google não disponível");
      }
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.type === "BARBER") {
        navigate("/agenda", { replace: true });
      } else {
        navigate("/reservas", { replace: true });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro de conexão. Tente novamente mais tarde.");
      }
    }
  };

  const handleGoogleError = () => {
    setError("Falha ao fazer login com Google. Tente novamente.");
  };

  const showGoogleLogin = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <AuthLayout
        title="Douglas Barbearia"
        subtitle="Entre na sua conta para continuar"
        backgroundImage="/images/barbeiro-background-login.jpg"
      >
          <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
            {showGoogleLogin && (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_black"
                shape="pill"
                size="large"
                text="continue_with"
                logo_alignment="left"
                width={280}
              />
            )}
          </Box>

          {showGoogleLogin && (
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                ou entre com email
              </Typography>
            </Divider>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
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
              autoComplete="current-password"
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
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
            </Button>
          </form>

          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Não tem uma conta?{" "}
              <Typography
                component="span"
                variant="body2"
                sx={{ 
                  color: "primary.main", 
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" }
                }}
                onClick={() => navigate("/cadastro")}
              >
                Cadastre-se
              </Typography>
            </Typography>
          </Box>
      </AuthLayout>
    </>
  );
}
