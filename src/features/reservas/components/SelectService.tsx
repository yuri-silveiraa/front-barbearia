import { type FC } from "react";
import { Box, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import { SelectionListSkeleton } from "../../../components/skeletons/SelectionSkeletons";
import type { Service } from "../../../api/reservas/types";

interface SelectServiceProps {
  services: Service[];
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error?: string;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const SelectService: FC<SelectServiceProps> = ({
  services,
  value,
  onChange,
  loading,
  error,
}) => {
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
        Escolha o serviço
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        O preço fica destacado para você confirmar antes do horário.
      </Typography>

      <Box sx={{ display: "grid", gap: 1.25 }}>
        {services.map((service) => {
          const selected = value === service.id;

          return (
            <Paper
              key={service.id}
              component="button"
              type="button"
              elevation={0}
              disabled={loading}
              onClick={() => onChange(service.id)}
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
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: 1.5,
                alignItems: "center",
                textAlign: "left",
                transition: "background-color 0.2s ease, border-color 0.2s ease",
                "&:hover": loading ? undefined : { borderColor: "primary.main" },
              }}
            >
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
                <Typography variant="caption" color="text.secondary">
                  {service.duration > 0 ? `${service.duration} min` : "Duração sob consulta"}
                </Typography>
              </Box>
              <Box sx={{ display: "grid", justifyItems: "end", gap: 0.75 }}>
                <Typography fontWeight={900} color="primary.main">
                  {currencyFormatter.format(service.price)}
                </Typography>
                {selected && <CheckCircleIcon color="primary" />}
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
