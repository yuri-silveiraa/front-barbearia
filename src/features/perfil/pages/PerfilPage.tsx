import { Box, Paper, Typography, Avatar, Divider, Grid, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { useAuth } from "../../../contexts/AuthContext";

export function PerfilPage() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: { xs: 1, sm: 2 } }}>
      <Typography 
        variant="h4" 
        sx={{ mb: 3, fontWeight: 700, textAlign: "center" }}
      >
        Meu Perfil
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          background: "linear-gradient(135deg, rgba(0,191,165,0.1) 0%, rgba(255,171,0,0.1) 100%)",
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{
                width: { xs: 80, sm: 120 },
                height: { xs: 80, sm: 120 },
                fontSize: { xs: "2rem", sm: "3rem" },
                fontWeight: 700,
                bgcolor: "primary.main",
                boxShadow: "0 4px 20px rgba(0,191,165,0.3)"
              }}
            >
              {user?.name ? getInitials(user.name) : "U"}
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "primary.main",
                borderRadius: "50%",
                p: 0.75,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "primary.dark"
                }
              }}
              onClick={() => alert("Funcionalidade em desenvolvimento!")}
            >
              <EditIcon sx={{ fontSize: { xs: 16, sm: 20 }, color: "white" }} />
            </Box>
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 600, mt: 2, textAlign: "center" }}>
            {user?.name || "Usuário"}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  flexShrink: 0
                }}
              >
                <PersonIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name || "Não informado"}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => alert("Funcionalidade em desenvolvimento!")}
                sx={{ flexShrink: 0 }}
              >
                Editar
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  flexShrink: 0
                }}
              >
                <EmailIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email || "Não informado"}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => alert("Funcionalidade em desenvolvimento!")}
                sx={{ flexShrink: 0 }}
              >
                Editar
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                  flexShrink: 0
                }}
              >
                <PhoneIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Telefone
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.phone || "Não informado"}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => alert("Funcionalidade em desenvolvimento!")}
                sx={{ flexShrink: 0 }}
              >
                Editar
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: "center" }}>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => alert("Funcionalidade em desenvolvimento!")}
          >
            Excluir Conta
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
