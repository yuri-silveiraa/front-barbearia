import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { getReservas, getServices } from "../../../api/reservas/reserva.service";
import { FeedbackBanner } from "../../../components/FeedbackBanner";
import type { Service } from "../../../api/reservas/types";
import type { Reserva } from "../../reservas/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;

  const baseUrl = import.meta.env.VITE_BASE_URL_API;
  if (baseUrl && baseUrl !== "/api") {
    return `${baseUrl.replace(/\/$/, "")}${imageUrl.replace(/^\/api/, "")}`;
  }

  return imageUrl;
}

function getNextReservation(reservas: Reserva[]) {
  const now = Date.now();

  return reservas
    .filter((reserva) => reserva.status === "SCHEDULED")
    .filter((reserva) => new Date(reserva.time).getTime() >= now)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())[0] ?? null;
}

export default function HomeClientePage() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHome() {
      try {
        setLoading(true);
        const [reservasData, servicesData] = await Promise.all([
          getReservas(),
          getServices(),
        ]);

        if (!active) return;
        setReservas(reservasData);
        setServices(servicesData);
      } catch {
        if (active) {
          setError("Erro ao carregar a página inicial");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHome();

    return () => {
      active = false;
    };
  }, []);

  const nextReservation = getNextReservation(reservas);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1160,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 3, md: 4 },
        animation: "homeFade .35s ease-out",
        "@keyframes homeFade": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <FeedbackBanner message={error} severity="error" onClose={() => setError("")} />

      <Box
        sx={{
          minHeight: { xs: 300, md: 360 },
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          p: { xs: 2.5, md: 5 },
          display: "flex",
          alignItems: "center",
          background:
            "linear-gradient(140deg, rgba(3, 12, 17, 0.96) 0%, rgba(8, 31, 40, 0.9) 48%, rgba(0, 191, 165, 0.28) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 78% 18%, rgba(255,171,0,0.22), transparent 28%), radial-gradient(circle at 18% 0%, rgba(0,191,165,0.2), transparent 30%)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 660 }}>
          <Chip
            icon={<EventAvailableIcon />}
            label={nextReservation ? "Próximo agendamento" : "Sua próxima visita"}
            sx={{
              mb: 2,
              bgcolor: "rgba(0, 191, 165, 0.14)",
              color: "primary.main",
              border: "1px solid rgba(0, 191, 165, 0.25)",
            }}
          />

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.04em",
              fontSize: { xs: "2.1rem", md: "3.8rem" },
              lineHeight: 0.95,
              mb: 2,
              maxWidth: 620,
            }}
          >
            {nextReservation ? nextReservation.service : "Escolha o horário do seu próximo corte."}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
            {nextReservation
              ? `${formatDateTime(nextReservation.time)} com ${nextReservation.barber}`
              : "Veja os serviços disponíveis e reserve em poucos passos."}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, maxWidth: 420 }}>
            {!nextReservation && (
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate("/reservas/create")}
              >
                Novo agendamento
              </Button>
            )}
            <Button
              variant={nextReservation ? "contained" : "outlined"}
              size="large"
              startIcon={<CalendarMonthIcon />}
              onClick={() => navigate("/reservas")}
            >
              {nextReservation ? "Ver agendamento" : "Meus agendamentos"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
              Serviços disponíveis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Escolha o atendimento que combina com o que você precisa.
            </Typography>
          </Box>
          <Chip label={`${services.length} serviços`} variant="outlined" sx={{ flexShrink: 0 }} />
        </Box>

        {services.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
              textAlign: "center",
              bgcolor: "background.paper",
            }}
          >
            <ContentCutIcon sx={{ color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">Nenhum serviço disponível no momento.</Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {services.map((service) => {
              const imageUrl = resolveImageUrl(service.imagemUrl);

              return (
                <Paper
                  key={service.id}
                  elevation={0}
                  component="button"
                  type="button"
                  onClick={() => setSelectedService(service)}
                  sx={{
                    minHeight: 172,
                    p: 2,
                    borderRadius: 2,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "grid",
                    gridTemplateColumns: "92px minmax(0, 1fr)",
                    gap: 1.5,
                    alignItems: "stretch",
                    textAlign: "left",
                    color: "inherit",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "transform .18s ease, border-color .18s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "rgba(0,191,165,0.42)",
                    },
                  }}
                >
                  {imageUrl ? (
                    <Box
                      component="img"
                      src={imageUrl}
                      alt={service.name}
                      loading="lazy"
                      sx={{
                        width: 92,
                        height: 122,
                        borderRadius: "8px",
                        objectFit: "cover",
                        objectPosition: "center 24%",
                        bgcolor: "action.hover",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 92,
                        height: 122,
                        borderRadius: "8px",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "action.hover",
                        color: "text.secondary",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <ContentCutIcon sx={{ fontSize: 32 }} />
                    </Box>
                  )}

                  <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" fontWeight={800} lineHeight={1.15} sx={{ overflowWrap: "anywhere" }}>
                      {service.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.75,
                        minHeight: 40,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {service.description || "Serviço da barbearia"}
                    </Typography>
                    <Typography color="primary.main" fontWeight={800} sx={{ mt: "auto", pt: 1 }}>
                      {formatCurrency(service.price)}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      <Dialog
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "8px", m: { xs: 1.5, sm: 3 } } }}
      >
        {selectedService && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
                Serviço
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {selectedService.name}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {resolveImageUrl(selectedService.imagemUrl) ? (
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: 320,
                      maxHeight: 460,
                      borderRadius: "8px",
                      bgcolor: "action.hover",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={resolveImageUrl(selectedService.imagemUrl) ?? undefined}
                      alt={selectedService.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        maxHeight: 460,
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: 220,
                      borderRadius: "8px",
                      bgcolor: "action.hover",
                      display: "grid",
                      placeItems: "center",
                      color: "text.secondary",
                    }}
                  >
                    <ContentCutIcon sx={{ fontSize: 56 }} />
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedService.description || "Serviço da barbearia"}
                  </Typography>
                  <Typography color="primary.main" fontWeight={900} sx={{ mt: 1 }}>
                    {formatCurrency(selectedService.price)}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
              <Button onClick={() => setSelectedService(null)} fullWidth>
                Fechar
              </Button>
              <Button variant="contained" onClick={() => navigate("/reservas/create")} fullWidth>
                Agendar serviço
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
