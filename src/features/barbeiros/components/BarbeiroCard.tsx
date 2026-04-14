import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import BlockIcon from "@mui/icons-material/Block";
import PhoneIcon from "@mui/icons-material/Phone";
import type { BarberAdmin } from "../types";

interface BarbeiroCardProps {
  barber: BarberAdmin;
  onDeactivate?: (barber: BarberAdmin) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPhone(value?: string) {
  const digits = (value ?? "").replace(/\D/g, "").slice(0, 11);
  if (!digits) return "Telefone não informado";
  const ddd = digits.slice(0, 2);
  const prefix = digits.slice(2, 7);
  const suffix = digits.slice(7, 11);
  if (digits.length <= 2) return `(${ddd}`;
  if (digits.length <= 7) return `(${ddd}) ${prefix}`;
  return `(${ddd}) ${prefix}-${suffix}`;
}

export function BarbeiroCard({ barber, onDeactivate }: BarbeiroCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "8px",
        border: "1px solid",
        borderColor: barber.isActive ? "divider" : "rgba(255,255,255,0.08)",
        bgcolor: barber.isActive ? "background.paper" : "rgba(255,255,255,0.03)",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: barber.isActive ? "primary.main" : "action.disabledBackground",
                color: barber.isActive ? "primary.contrastText" : "text.secondary",
                fontWeight: 800,
              }}
            >
              {getInitials(barber.nome)}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h6" fontWeight={800} lineHeight={1.15} sx={{ overflowWrap: "anywhere" }}>
                {barber.nome}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                {barber.isAdmin && <Chip size="small" color="primary" label="Admin" />}
                <Chip
                  size="small"
                  color={barber.isActive ? "success" : "default"}
                  label={barber.isActive ? "Ativo" : "Inativo"}
                  variant={barber.isActive ? "filled" : "outlined"}
                />
              </Stack>
            </Box>
          </Box>

          <Divider flexItem />

          <Stack spacing={1}>
            <Box sx={{ display: "grid", gridTemplateColumns: "24px minmax(0, 1fr)", gap: 1, alignItems: "center" }}>
              <AlternateEmailIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary" noWrap>
                {barber.email || "Email não informado"}
              </Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "24px minmax(0, 1fr)", gap: 1, alignItems: "center" }}>
              <PhoneIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {formatPhone(barber.telefone)}
              </Typography>
            </Box>
          </Stack>

          {onDeactivate && barber.isActive && (
            <Button
              color="error"
              variant="text"
              startIcon={<BlockIcon />}
              onClick={() => onDeactivate(barber)}
              fullWidth
              sx={{ minHeight: 38 }}
            >
              Desativar acesso
            </Button>
          )}

          {onDeactivate && !barber.isActive && (
            <Typography variant="caption" color="text.disabled">
              Este barbeiro não acessa mais o sistema.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
