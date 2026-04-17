import { Box, Paper, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCutIcon from "@mui/icons-material/ContentCut";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  backgroundImage?: string;
  logoSrc?: string;
}

export function AuthLayout({
  title,
  subtitle,
  children,
  showBack,
  onBack,
  backgroundImage,
  logoSrc
}: AuthLayoutProps) {
  const background = backgroundImage
    ? `linear-gradient(135deg, rgba(10, 16, 26, 0.9) 0%, rgba(10, 16, 26, 0.7) 50%, rgba(10, 16, 26, 0.9) 100%), url(${backgroundImage})`
    : "linear-gradient(135deg, #0b1220 0%, #101b2d 55%, #0b1220 100%)";

  return (
    <Box
      sx={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: background,
        backgroundSize: "cover",
        backgroundPosition: "center",
        p: 2,
        pb: "calc(16px + env(safe-area-inset-bottom))"
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(16, 22, 36, 0.88)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
          overflow: "hidden"
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {showBack && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Voltar
            </Button>
          )}

          <Box sx={{ textAlign: "center", mb: 3 }}>
            {logoSrc ? (
              <Box
                component="img"
                src={logoSrc}
                alt={title}
                sx={{
                  width: { xs: 104, sm: 120 },
                  height: { xs: 104, sm: 120 },
                  objectFit: "contain",
                  display: "block",
                  mx: "auto",
                  mb: 1.5,
                  filter: "drop-shadow(0 14px 24px rgba(0, 0, 0, 0.42))"
                }}
              />
            ) : (
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
                  boxShadow: "0 10px 24px rgba(0, 191, 165, 0.35)"
                }}
              >
                <ContentCutIcon sx={{ color: "white", fontSize: 30 }} />
              </Box>
            )}

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: { xs: "1.6rem", sm: "2rem" }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {children}
        </Box>
      </Paper>
    </Box>
  );
}
