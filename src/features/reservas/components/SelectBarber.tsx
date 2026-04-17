import { type FC } from "react";
import { Box, Paper, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import { SelectionListSkeleton } from "../../../components/skeletons/SelectionSkeletons";
import type { Barber } from "../../../api/reservas/types";

interface SelectBarberProps {
  barbers: Barber[];
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error?: string;
}

const SelectBarber: FC<SelectBarberProps> = ({
  barbers,
  value,
  onChange,
  loading,
  error,
}) => {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (loading) {
    return <SelectionListSkeleton avatar />;
  }

  if (!loading && barbers.length === 0) {
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
        <PersonIcon sx={{ color: "text.disabled", mb: 1 }} />
        <Typography color="text.secondary">Nenhum barbeiro disponível.</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
        Escolha o barbeiro
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Toque no profissional para continuar montando seu horário.
      </Typography>

      <Box sx={{ display: "grid", gap: 1.25 }}>
        {barbers.map((barber) => {
          const selected = value === barber.id;

          return (
            <Paper
              key={barber.id}
              component="button"
              type="button"
              elevation={0}
              disabled={loading}
              onClick={() => onChange(barber.id)}
              sx={{
                width: "100%",
                p: 3,
                borderRadius: 2,
                border: "1px solid",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "rgba(0, 191, 165, 0.08)" : "background.paper",
                color: "inherit",
                cursor: loading ? "default" : "pointer",
                display: "grid",
                gridTemplateColumns: { xs: "86px minmax(0, 1fr) auto", sm: "96px minmax(0, 1fr) auto" },
                gap: { xs: 1.5, sm: 2 },
                alignItems: "center",
                textAlign: "left",
                transition: "background-color 0.2s ease, border-color 0.2s ease",
                "&:hover": loading ? undefined : { borderColor: "primary.main" },
              }}
            >
              <Box
                sx={{
                  width: { xs: 86, sm: 96 },
                  height: { xs: 108, sm: 120 },
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: selected ? "rgba(0, 191, 165, 0.16)" : "action.hover",
                  border: "1px solid",
                  borderColor: selected ? "primary.main" : "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {barber.profileImageUrl ? (
                  <Box
                    component="img"
                    src={barber.profileImageUrl}
                    alt={barber.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography variant="h5" fontWeight={900} color={selected ? "primary.main" : "text.secondary"}>
                    {getInitials(barber.name)}
                  </Typography>
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" fontWeight={800} noWrap>
                  {barber.name}
                </Typography>
              </Box>
              {selected && <CheckCircleIcon color="primary" sx={{ fontSize: 28 }} />}
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

export default SelectBarber;
