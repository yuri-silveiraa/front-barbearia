import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { BarberAdmin } from "../types";

interface BarbeiroCardProps {
  barber: BarberAdmin;
  onDeactivate?: (barber: BarberAdmin) => void;
}

export function BarbeiroCard({ barber, onDeactivate }: BarbeiroCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {barber.nome}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              {barber.isAdmin && <Chip size="small" color="primary" label="Admin" />}
              <Chip
                size="small"
                color={barber.isActive ? "success" : "default"}
                label={barber.isActive ? "Ativo" : "Inativo"}
              />
            </Box>
          </Box>
          {onDeactivate && (
            <Tooltip title="Desativar barbeiro">
              <IconButton color="error" onClick={() => onDeactivate(barber)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
