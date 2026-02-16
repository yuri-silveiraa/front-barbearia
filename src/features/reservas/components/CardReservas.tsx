import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import type { Reserva } from "../types";
import { statusMap } from "../types";

interface CardReservasProps {
  reserva: Reserva;
  onEdit?: (reserva: Reserva) => void;
  onDelete?: (reserva: Reserva) => void;
  showActions?: boolean;
}

export function CardReservas({ 
  reserva, 
  onEdit, 
  onDelete, 
  showActions = true 
}: CardReservasProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "primary";
      case "COMPLETED":
        return "success";
      case "CANCELED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card sx={{ mb: 2, position: "relative" }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {reserva.service}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Cliente:</strong> {reserva.client}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Barbeiro:</strong> {reserva.barber}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Horário:</strong> {reserva.time}
            </Typography>
            
            <Chip
              label={statusMap[reserva.status as keyof typeof statusMap]}
              color={getStatusColor(reserva.status)}
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>

          {showActions && (
            <Box display="flex" gap={1}>
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={() => onEdit(reserva)}
                  color="primary"
                >
                  <Edit />
                </IconButton>
              )}
              
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDelete(reserva)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}