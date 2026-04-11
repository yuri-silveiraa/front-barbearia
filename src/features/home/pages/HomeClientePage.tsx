import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ScheduleIcon from "@mui/icons-material/Schedule";
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
          minHeight: { xs: 280, md: 360 },
          borderRadius: { xs: 4, md: 6 },
          overflow: "hidden",
          position: "relative",
          p: { xs: 3, md: 5 },
          display: "flex",
          alignItems: "flex-end",
          background:
            "linear-gradient(140deg, rgba(3, 12, 17, 0.96) 0%, rgba(8, 31, 40, 0.9) 48%, rgba(0, 191, 165, 0.28) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 78% 18%, rgba(255,171,0,0.22), transparent 28%), radial-gradient(circle at 18% 0%, rgba(0,191,165,0.2), transparent 30%)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 660 }}>
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
            }}
          >
            {nextReservation ? nextReservation.service : "Escolha o horário do seu próximo corte."}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
            {nextReservation
              ? `${formatDateTime(nextReservation.time)} com ${nextReservation.barber}`
              : "Veja os serviços disponíveis e reserve em poucos passos."}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate("/reservas/create")}
            >
              Novo agendamento
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<CalendarMonthIcon />}
              onClick={() => navigate("/reservas")}
            >
              Meus agendamentos
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
          gap: 3,
          alignItems: "stretch",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: "rgba(0,191,165,0.16)", color: "primary.main" }}>
              <ScheduleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={750}>
                Agenda rápida
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Acompanhe seu próximo atendimento.
              </Typography>
            </Box>
          </Stack>

          {nextReservation ? (
            <Box>
              <Typography variant="h5" fontWeight={750}>
                {formatDateTime(nextReservation.time)}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {nextReservation.service} com {nextReservation.barber}
              </Typography>
            </Box>
          ) : (
            <Typography color="text.secondary">
              Você ainda não tem um agendamento futuro. Crie um para garantir seu horário.
            </Typography>
          )}
        </Paper>

        <Box>
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
            Serviços disponíveis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Escolha o serviço que combina com o atendimento que você quer.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            {services.slice(0, 4).map((service) => {
              const imageUrl = resolveImageUrl(service.imagemUrl);

              return (
                <Paper
                  key={service.id}
                  elevation={0}
                  onClick={() => navigate("/reservas/create")}
                  sx={{
                    minHeight: 190,
                    p: 2,
                    borderRadius: 4,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-end",
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "transform .18s ease, border-color .18s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      borderColor: "rgba(0,191,165,0.42)",
                    },
                  }}
                >
                  {imageUrl ? (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.78)), url(${imageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, rgba(0,191,165,0.22), rgba(255,171,0,0.1)), #111",
                      }}
                    />
                  )}

                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <ContentCutIcon sx={{ color: "primary.main", mb: 1 }} />
                    <Typography variant="h6" fontWeight={800}>
                      {service.name}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.72)" sx={{ mb: 1 }}>
                      {service.description || "Serviço da barbearia"}
                    </Typography>
                    <Typography color="primary.main" fontWeight={800}>
                      {formatCurrency(service.price)}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
