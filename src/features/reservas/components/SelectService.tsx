import { type FC } from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { SelectionListSkeleton } from "../../../components/skeletons/SelectionSkeletons";
import type { Service } from "../../../api/reservas/types";

interface SelectServiceProps {
  services: Service[];
  value: string[];
  onChange: (value: string[]) => void;
  loading: boolean;
  error?: string;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDuration(minutes: number) {
  if (!minutes || minutes <= 0) return "Duração sob consulta";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours > 0 && rest > 0) return `${hours}h${rest}m`;
  if (hours > 0) return `${hours}h`;
  return `${rest}m`;
}

const SelectService: FC<SelectServiceProps> = ({
  services,
  value,
  onChange,
  loading,
  error,
}) => {
  const handleToggle = (serviceId: string) => {
    if (value.includes(serviceId)) {
      onChange(value.filter((id) => id !== serviceId));
    } else {
      onChange([...value, serviceId]);
    }
  };

  if (loading) {
    return <SelectionListSkeleton />;
  }

  if (!loading && services.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <ContentCutIcon sx={{ color: "text.disabled", mb: 1 }} />
        <Typography color="text.secondary">Nenhum serviço disponível.</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
        Escolha os serviços
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Selecione um ou mais serviços. A duração total define os horários disponíveis.
      </Typography>

      <Box sx={{ display: "grid", gap: 1.25 }}>
        {services.map((service) => {
          const selected = value.includes(service.id);

          return (
            <Paper
              key={service.id}
              component="button"
              type="button"
              elevation={0}
              disabled={loading}
              onClick={() => handleToggle(service.id)}
              sx={{
                width: "100%",
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "rgba(0, 191, 165, 0.08)" : "background.paper",
                color: "inherit",
                cursor: loading ? "default" : "pointer",
                display: "grid",
                gridTemplateColumns: service.imagemUrl
                  ? { xs: "86px minmax(0, 1fr) auto", sm: "96px minmax(0, 1fr) auto" }
                  : "minmax(0, 1fr) auto",
                gap: 1.5,
                alignItems: "center",
                textAlign: "left",
                transition: "background-color 0.2s ease, border-color 0.2s ease",
                "&:hover": loading ? undefined : { borderColor: "primary.main" },
              }}
            >
              {service.imagemUrl && (
                <Box
                  component="img"
                  src={service.imagemUrl}
                  alt={service.name}
                  sx={{
                    width: { xs: 86, sm: 96 },
                    height: { xs: 108, sm: 120 },
                    borderRadius: 2,
                    objectFit: "cover",
                    bgcolor: "action.hover",
                  }}
                />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                  <ContentCutIcon color="primary" fontSize="small" />
                  <Typography fontWeight={800} noWrap>
                    {service.name}
                  </Typography>
                </Box>
                {service.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                    {service.description}
                  </Typography>
                )}
                <Chip size="small" label={formatDuration(service.duration)} variant="outlined" />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography fontWeight={900} color="primary.main">
                  {currencyFormatter.format(service.price)}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default SelectService;
