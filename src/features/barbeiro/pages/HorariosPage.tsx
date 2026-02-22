import { Box, Typography, Paper, Alert } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";

export default function HorariosPage() {
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: 2, py: 2 }}>
      <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700, textAlign: "center" }}>
        Gerenciar Horários
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        Configure seus horários de trabalho
      </Typography>

      <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
        <ScheduleIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Em breve
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Esta funcionalidade está em desenvolvimento.
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          Em breve você poderá criar e gerenciar seus horários de trabalho.
        </Alert>
      </Paper>
    </Box>
  );
}
