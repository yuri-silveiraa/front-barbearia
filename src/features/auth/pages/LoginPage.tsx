import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
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
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { loginSchema } from "../../../api/auth/schema";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { useAuth } from "../../../contexts/AuthContext";
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
              Douglas Barbearia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Entre na sua conta para continuar
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            {showGoogleLogin && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: 360,
                    p: 1,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    shape="pill"
                    size="large"
                    text="continue_with"
                    logo_alignment="left"
                    width={320}
                  />
                </Box>
              </Box>
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
        </CardContent>
      </Card>
    </Box>
  );
}
