import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { Service } from "../types";

interface CardServicoProps {
  service: Service;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
}

export function CardServico({ 
  service, 
  onEdit, 
  onDelete 
}: CardServicoProps) {
  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours > 0 && rest > 0) return `${hours}h${rest}m`;
    if (hours > 0) return `${hours}h`;
    return `${rest}m`;
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 172,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: "grid", gridTemplateColumns: "92px minmax(0, 1fr)", gap: 1.5, alignItems: "stretch" }}>
            {service.imagemUrl ? (
              <Box
                component="img"
                src={service.imagemUrl}
                alt={service.nome}
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
                {service.nome}
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
                {service.descrição || "Sem descrição cadastrada."}
              </Typography>
              <Box sx={{ mt: "auto", pt: 1 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                  <Chip label={formatCurrency(service.preço)} color="primary" size="small" sx={{ fontWeight: 800 }} />
                  <Chip label={formatDuration(service.duration)} variant="outlined" size="small" />
                </Stack>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr" },
              gap: 1,
            }}
          >
            {onEdit && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                onClick={() => onEdit(service)}
                sx={{ minHeight: 38 }}
              >
                Editar
              </Button>
            )}

            {onDelete && (
              <Button
                size="small"
                variant="text"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => onDelete(service)}
                color="error"
                sx={{ minHeight: 38 }}
              >
                Excluir
              </Button>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
