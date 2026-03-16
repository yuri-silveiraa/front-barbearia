import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
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
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {service.nome}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {service.descrição || "Sem descrição"}
            </Typography>
            
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ mt: 2, fontWeight: 600 }}
            >
              {formatCurrency(service.preço)}
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={0.5}>
            {onEdit && (
              <IconButton
                size="small"
                onClick={() => onEdit(service)}
                color="primary"
              >
                <Edit />
              </IconButton>
            )}
            
            {onDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(service)}
                color="error"
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
