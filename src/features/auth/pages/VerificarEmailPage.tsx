import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import { resendVerificationCode } from "../../../api/auth/auth.service";
import { useAuth } from "../../../contexts/AuthContext";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import { AuthLayout } from "../../../layouts/AuthLayout";

export default function VerificarEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const { verifyEmailAndLogin } = useAuth();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("Código deve ter 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await verifyEmailAndLogin(code);
      setSuccess("Email verificado com sucesso!");
      setTimeout(() => {
        if (user.type === "BARBER") {
          navigate("/agenda");
        } else {
          navigate("/home");
        }
      }, 800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao verificar código");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email não encontrado. Faça login novamente.");
      return;
    }

    setResending(true);
    setError("");

    try {
      await resendVerificationCode(email);
      setSuccess("Código reenviado!");
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao reenviar código");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />
      <FeedbackBanner message={success} severity="success" onClose={() => setSuccess("")} />
      <AuthLayout
        title="Verificar Email"
        subtitle="Digite o código de 6 dígitos enviado para você"
        backgroundImage="/images/barbeiro-background-login.jpg"
      >
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <EmailIcon sx={{ fontSize: 44, color: "primary.main", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            <strong>{email}</strong>
          </Typography>
        </Box>

        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Link
            component="button"
            type="button"
            onClick={() => navigate("/cadastro", { state: { email } })}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              color: "text.secondary",
              textDecoration: "none",
              fontSize: "0.875rem",
              "&:hover": { color: "primary.main", textDecoration: "underline" }
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
            Corrigir email
          </Link>
        </Box>

        <TextField
          fullWidth
          label="Código de verificação"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            maxLength: 6,
            style: {
              textAlign: "center",
              letterSpacing: "0.4em",
              fontSize: "1.4rem"
            }
          }}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Verificar"}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
        >
          {resending
            ? "Enviando..."
            : cooldown > 0
              ? `Aguarde ${cooldown}s`
              : "Reenviar código"}
        </Button>
      </AuthLayout>
    </>
  );
}
